/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * Local only, excluded from git. Runs the entity inventory generator and executor with the real
 * functions, in the same order as `listEntities`, and serves page.html to drive them.
 */

import { readFileSync } from 'fs';
import { createServer } from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import { join } from 'path';
import { Client } from '@elastic/elasticsearch';
import type { ElasticsearchClient } from '@kbn/core/server';
import type { EntityDefinitionWithoutId } from '@kbn/entity-store/common';
import { entitySchema, getIdentityCompositions } from '@kbn/entity-store/common';
import {
  buildColumns,
  generateCountQuery,
  generateListQueries,
  getDynamicBlock,
  planSources,
  resolveIdentityPlan,
} from '../server/inventory/generator';
import type { QueryPlan, ResolvedSource, TimeWindow } from '../server/inventory/generator';
import {
  applyLimit,
  applyValueLabels,
  executeEsql,
  fillColumns,
  isTruncated,
  mergeRows,
  orderRows,
  planAvailability,
  resolveFieldAvailability,
  resolveSourceIndices,
  toSourceError,
} from '../server/inventory/executor';
import type { PlanResult } from '../server/inventory/executor';
import { DEFINITION_PRESETS } from './presets';

// list_entities.ts is not always in the working tree (it can be stashed); without it the Executor
// skips its last step, the comparison against the real orchestration.
type ListEntities = typeof import('../server/inventory/list_entities').listEntities;
const listEntitiesPromise: Promise<ListEntities | undefined> = import('../server/inventory/list_entities').then(
  ({ listEntities }) => listEntities,
  () => undefined
);

const ES_URL = process.env.ES_URL ?? 'http://localhost:9200';
const ES_USERNAME = process.env.ES_USERNAME ?? 'elastic';
const ES_PASSWORD = process.env.ES_PASSWORD ?? 'changeme';
const PORT = Number(process.env.PORT ?? 5700);

// `@elastic/elasticsearch`'s client is what Kibana's `ElasticsearchClient` wraps.
const client = new Client({
  node: ES_URL,
  auth: { username: ES_USERNAME, password: ES_PASSWORD },
}) as unknown as ElasticsearchClient;

interface Step {
  key: string;
  title: string;
  functions: string;
  description: string;
  data?: unknown;
  error?: string;
}

interface RunRequest {
  definition: string;
  from: string;
  to: string;
  limit: number;
  checkReadability: boolean;
}

const errorText = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

// Maps and sets do not survive JSON.stringify on their own.
const replacer = (_key: string, value: unknown) => {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value instanceof Set) return [...value];
  return value;
};

const parseDefinition = (text: string): EntityDefinitionWithoutId => {
  const json = JSON.parse(text);
  const parsed = entitySchema.safeParse({ id: 'playground', ...json });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues
        .map(({ path, message }) => `${path.join('.') || '(root)'}: ${message}`)
        .join('\n')
    );
  }
  return parsed.data;
};

// Collects steps; a throwing step is recorded and stops the run.
const recorder = () => {
  const steps: Step[] = [];
  const step = async <T>(
    meta: Omit<Step, 'data' | 'error'>,
    run: () => T | Promise<T>,
    show: (value: T) => unknown = (value) => value
  ): Promise<T> => {
    try {
      const value = await run();
      steps.push({ ...meta, data: show(value) });
      return value;
    } catch (error) {
      steps.push({ ...meta, error: errorText(error) });
      throw error;
    }
  };
  return { steps, step };
};

type StepFn = ReturnType<typeof recorder>['step'];

// Shared by both tools: the definition, its identity, and the resolved indices `planSources` needs.
const prepare = async (step: StepFn, { definition: text, checkReadability }: RunRequest) => {
  const definition = await step(
    {
      key: 'definition',
      title: 'Definition',
      functions: 'entitySchema.safeParse',
      description:
        'The JSON checked against the entity store schema, including the dynamic rules (servable identity, attributes are not identity fields).',
    },
    () => parseDefinition(text),
    (value) => ({
      type: value.type,
      name: value.name,
      identityKind: 'singleField' in value.identityField ? 'single field' : 'ranking',
      sources: getDynamicBlock(value).sources,
    })
  );

  const identity = await step(
    {
      key: 'identity',
      title: 'Identity',
      functions: 'resolveIdentityPlan',
      description:
        'How an entity id is computed: what STATS groups by, which documents have an id at all, and the EVAL that builds entity.id.',
    },
    () => resolveIdentityPlan(definition)
  );

  const patterns = getDynamicBlock(definition).sources.map(({ indexPattern }) => indexPattern);
  const byPattern = await step(
    {
      key: 'resolve',
      title: 'Resolved indices',
      functions: 'resolveSourceIndices',
      description:
        'indices.get per pattern for the concrete indices and their mode, then one _has_privileges call to keep the readable ones.',
    },
    () => resolveSourceIndices(client, patterns, { checkReadability }),
    (value) => patterns.map((pattern) => ({ pattern, ...value.get(pattern) }))
  );
  const resolved: ResolvedSource[] = patterns.map((pattern) => {
    const result = byPattern.get(pattern);
    return { indices: result?.usable ? result.indices : [] };
  });

  return { definition, identity, resolved };
};

const generate = async (request: RunRequest) => {
  const { steps, step } = recorder();
  const window: TimeWindow = { from: request.from, to: request.to };
  try {
    const { definition, identity, resolved } = await prepare(step, request);
    const plans = await step(
      {
        key: 'plans',
        title: 'Plans',
        functions: 'planSources',
        description:
          'One plan per source and index mode, TS before FROM. A source with one mode is queried by its pattern; a split source by its concrete indices. A source with no usable index gives no plan.',
      },
      () => planSources(definition, resolved)
    );
    await step(
      {
        key: 'columns',
        title: 'Output columns',
        functions: 'buildColumns',
        description: 'The columns of the final table. The kind decides how rows are merged.',
      },
      () => buildColumns(definition, plans, identity)
    );
    if (plans.length === 0) return { steps };
    await step(
      {
        key: 'listQueries',
        title: 'List queries',
        functions: 'generateListQueries',
        description:
          'One ES|QL query per plan. The executor drops plans that cannot build an id before running, so it may run fewer.',
      },
      () => generateListQueries(definition, plans, window, request.limit),
      (queries) => queries.map((query, position) => ({ plan: plans[position], ...query }))
    );
    await step(
      {
        key: 'countQuery',
        title: 'Count query',
        functions: 'generateCountQuery',
        description:
          'One query over every plan. count is the number of distinct entity ids; raw_groups the identity groups before they are merged by id.',
      },
      () => generateCountQuery(definition, plans, window),
      (query) => ({ plans, ...query })
    );
  } catch {
    // The failing step carries the error.
  }
  return { steps };
};

const execute = async (request: RunRequest) => {
  const { steps, step } = recorder();
  const window: TimeWindow = { from: request.from, to: request.to };
  const { limit, checkReadability } = request;
  try {
    const { definition, identity, resolved } = await prepare(step, request);
    const planned = planSources(definition, resolved);
    const compositions = getIdentityCompositions(definition.identityField);
    const identityFields = [...new Set(compositions.flat())];

    const verdicts = await step(
      {
        key: 'availability',
        title: 'Field availability',
        functions: 'resolveFieldAvailability · planAvailability',
        description:
          'field_caps says which identity and attribute fields each index maps. A plan is kept when one of its indices maps every field of one identity composition.',
      },
      async () => {
        const availability = await resolveFieldAvailability(
          client,
          planned.map(({ indexPattern, indices, attributes }) => ({
            indexPattern,
            indices,
            fields: [...identityFields, ...attributes.map(({ field }) => field)],
          }))
        );
        return planned.map((plan) => {
          const fields = availability.get(plan.indexPattern);
          const fieldsAsked = [...identityFields, ...plan.attributes.map(({ field }) => field)];
          if (!fields || fields.failed) {
            return {
              plan,
              fieldsAsked,
              mapped: null,
              verdict: {
                usable: false,
                reason: fields?.failed ? fields.reason : 'field capabilities returned nothing',
                unavailableFields: [],
              },
            };
          }
          return {
            plan,
            fieldsAsked,
            mapped: fields.mappedByIndex,
            verdict: planAvailability(plan, fields.mappedByIndex, compositions),
          };
        });
      },
      (value) => ({ compositions, plans: value })
    );
    const plans: QueryPlan[] = verdicts
      .filter(({ verdict }) => verdict.usable)
      .map(({ plan }) => plan);
    if (plans.length === 0) return { steps };

    const listQueries = generateListQueries(definition, plans, window, limit);
    const countQuery = generateCountQuery(definition, plans, window);

    const listOutcomes = await step(
      {
        key: 'listResults',
        title: 'List results',
        functions: 'executeEsql',
        description: 'Each kept plan’s list query run as is: one row per raw identity group.',
      },
      () => Promise.allSettled(listQueries.map((query) => executeEsql(client, query))),
      (outcomes) =>
        outcomes.map((outcome, position) => ({
          plan: plans[position],
          esql: listQueries[position].esql,
          ...(outcome.status === 'fulfilled'
            ? outcome.value
            : { error: toSourceError(plans[position].indexPattern, outcome.reason) }),
        }))
    );

    await step(
      {
        key: 'countResult',
        title: 'Count',
        functions: 'executeEsql',
        description: 'The count query over the kept plans.',
      },
      () => executeEsql(client, countQuery),
      (result) => ({ esql: countQuery.esql, ...result })
    ).catch(() => undefined);

    const planResults = await step(
      {
        key: 'labels',
        title: 'Value labels',
        functions: 'applyValueLabels',
        description:
          'Raw attribute values replaced by their labels, per plan, before the merge. Only attributes with valueLabels change.',
      },
      () =>
        plans.flatMap((plan, position): PlanResult[] => {
          const outcome = listOutcomes[position];
          if (outcome.status === 'rejected') return [];
          const { columns, rows } = outcome.value;
          return [{ plan, columns, rows: applyValueLabels(rows, plan) }];
        }),
      (results) =>
        results.map(({ plan, rows }) => ({
          plan,
          labelled: plan.attributes.filter(({ valueLabels }) => valueLabels !== undefined),
          rows,
        }))
    );

    const outputColumns = buildColumns(definition, plans, identity);
    const merged = await step(
      {
        key: 'merge',
        title: 'Merge',
        functions: 'mergeRows',
        description:
          'One row per entity.id across plans. Identity: first non-null. last_seen: newest. Attribute: from the newest row that has it. A null never replaces a value.',
      },
      () => mergeRows(planResults, outputColumns)
    );

    await step(
      {
        key: 'final',
        title: 'Final',
        functions: 'orderRows · applyLimit · fillColumns · isTruncated',
        description:
          'last_seen descending (nulls last, ties by entity.id), the first limit rows, every column filled.',
      },
      () => {
        const rows = fillColumns(applyLimit(orderRows(merged.rows), limit), outputColumns);
        return { rows, columns: merged.columns, limit };
      }
    );

    const listEntities = await listEntitiesPromise;
    if (!listEntities) return { steps };
    await step(
      {
        key: 'compare',
        title: 'vs listEntities',
        functions: 'listEntities',
        description:
          'The real orchestration on the same input. Its rows should equal the Final tab; if not, these steps drifted from list_entities.ts.',
      },
      () => listEntities({ client, definition, window, limit, checkReadability }),
      (result) => ({ ...result, truncatedCheck: isTruncated(result.total, result.rows.length) })
    );
  } catch {
    // The failing step carries the error.
  }
  return { steps };
};

const readBody = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

const send = (response: ServerResponse, status: number, type: string, body: string) => {
  response.writeHead(status, { 'Content-Type': type });
  response.end(body);
};

export const start = () => {
  createServer(async (request, response) => {
    try {
      if (request.method === 'GET' && request.url === '/') {
        // Read on every request so page edits show on reload.
        return send(response, 200, 'text/html', readFileSync(join(__dirname, 'page.html'), 'utf8'));
      }
      if (request.method === 'GET' && request.url === '/default-definition') {
        // The playground's own default, so it does not depend on uncommitted plugin files.
        const [{ definition }] = DEFINITION_PRESETS;
        return send(response, 200, 'application/json', JSON.stringify(definition, null, 2));
      }
      if (request.method === 'GET' && request.url === '/presets') {
        return send(response, 200, 'application/json', JSON.stringify(DEFINITION_PRESETS));
      }
      if (
        request.method === 'POST' &&
        (request.url === '/generate' || request.url === '/execute')
      ) {
        const body: RunRequest = JSON.parse(await readBody(request));
        const result = request.url === '/generate' ? await generate(body) : await execute(body);
        return send(response, 200, 'application/json', JSON.stringify(result, replacer));
      }
      send(response, 404, 'text/plain', 'not found');
    } catch (error) {
      send(response, 500, 'application/json', JSON.stringify({ error: errorText(error) }));
    }
  }).listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Entity inventory playground on http://localhost:${PORT} (Elasticsearch ${ES_URL})`
    );
  });
};
