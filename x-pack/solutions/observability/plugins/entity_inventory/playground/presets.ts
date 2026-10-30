/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * Local only, excluded from git. Hard-coded definitions for every identity shape the entity store
 * schema allows, served to page.html for the preset dropdown. The `servable` ones pass the
 * inventory's rules; the `rejected` ones show each rule (or schema check) that turns one away.
 *
 * Identity shapes (EntityIdentity):
 *   { singleField }                                    one field
 *   { euidRanking: { branches: [{ ranking }] }, documentsFilter }
 *     ranking: compositions, first one a document has every field of wins
 *     composition: [{ field } | { sep }], at least one field
 * documentsFilter must be the presence filter of the ranking: per composition every field exists
 * and is not "", OR-ed across compositions in ranking order.
 */

/** Whether the inventory accepts the definition, so the playground can say what to expect. */
export type PresetOutcome = 'servable' | 'rejected';

/** A hard-coded definition the playground offers in its preset dropdown. */
export interface DefinitionPreset {
  id: string;
  /** The identity shape the preset demonstrates; the dropdown's option group. */
  group: string;
  label: string;
  /** What the preset shows, and for a rejected one the rule that rejects it. */
  note: string;
  outcome: PresetOutcome;
  /** Kept loose: rejected presets break the definition types on purpose. */
  definition: Record<string, unknown>;
}

// ---------- sources ----------

const OTEL_KUBELETSTATS = 'metrics-kubeletstatsreceiver.otel-*';

const OTEL_POD_SOURCE = {
  indexPattern: OTEL_KUBELETSTATS,
  attributes: [
    { name: 'k8s.pod.name', field: 'k8s.pod.name' },
    { name: 'k8s.namespace.name', field: 'k8s.namespace.name' },
    { name: 'k8s.node.name', field: 'k8s.node.name' },
    { name: 'k8s.cluster.name', field: 'k8s.cluster.name' },
  ],
};

const ECS_POD_SOURCE = {
  indexPattern: 'metrics-kubernetes.pod-*',
  attributes: [
    { name: 'k8s.pod.name', field: 'kubernetes.pod.name' },
    { name: 'k8s.namespace.name', field: 'kubernetes.namespace' },
    { name: 'k8s.node.name', field: 'kubernetes.node.name' },
    { name: 'k8s.cluster.name', field: 'orchestrator.cluster.name' },
    { name: 'kubernetes.pod.ip', field: 'kubernetes.pod.ip' },
  ],
};

const ECS_STATE_POD_SOURCE = {
  indexPattern: 'metrics-kubernetes.state_pod-*',
  attributes: [
    { name: 'k8s.pod.name', field: 'kubernetes.pod.name' },
    { name: 'k8s.namespace.name', field: 'kubernetes.namespace' },
    { name: 'kubernetes.pod.status.phase', field: 'kubernetes.pod.status.phase' },
  ],
};

const OTEL_CLUSTER_SOURCE = {
  indexPattern: OTEL_KUBELETSTATS,
  attributes: [{ name: 'k8s.cluster.name', field: 'k8s.cluster.name' }],
};

const ECS_NODE_SOURCE = {
  indexPattern: 'metrics-kubernetes.node-*',
  attributes: [{ name: 'k8s.cluster.name', field: 'orchestrator.cluster.name' }],
};

const ECS_POD_CLUSTER_SOURCE = {
  indexPattern: 'metrics-kubernetes.pod-*',
  attributes: [{ name: 'k8s.cluster.name', field: 'orchestrator.cluster.name' }],
};

// Existence only: no attributes, for identities that already read every useful field.
const OTEL_EXISTENCE_SOURCE = { indexPattern: OTEL_KUBELETSTATS };
const ECS_POD_EXISTENCE_SOURCE = { indexPattern: 'metrics-kubernetes.pod-*' };

// The store's `isNotEmptyCondition`: present and not the empty string.
const present = (field: string) => ({
  and: [
    { field, exists: true },
    { field, neq: '' },
  ],
});

// ---------- servable ----------

const SINGLE_FIELD = 'Single field';
const RANKED_SINGLE = 'Ranking · one composition, one field';
const RANKED_FALLBACK = 'Ranking · several single-field compositions';
const TUPLE_WITH_SEP = 'Ranking · tuple with separator';
const TUPLE_WITHOUT_SEP = 'Ranking · tuple without separator';
const LITERAL_SUFFIX = 'Ranking · literal suffix';
const MIXED = 'Ranking · tuple, then single-field fallback';
const MAX_FIELDS = 'Ranking · 8 identity fields (the maximum)';
const REJECTED_RULES = 'Rejected by the inventory rules';
const REJECTED_SCHEMA = 'Rejected by the schema';
const REJECTED_COMPILE = 'Rejected when the id is compiled';

const SERVABLE: DefinitionPreset[] = [
  {
    id: 'start:pod-otel-ecs',
    group: 'Start here',
    label: 'Pod by uid · OpenTelemetry + ECS',
    note: 'One pod, two schemas: OpenTelemetry reports k8s.pod.uid, ECS (Elastic Agent) reports kubernetes.pod.uid. The ranking tries k8s.pod.uid first, else kubernetes.pod.uid; both sources fill the same columns, and rows with the same uid merge into one entity.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [{ ranking: [[{ field: 'k8s.pod.uid' }], [{ field: 'kubernetes.pod.uid' }]] }],
        },
        documentsFilter: { or: [present('k8s.pod.uid'), present('kubernetes.pod.uid')] },
      },
      dynamic: { sources: [OTEL_POD_SOURCE, ECS_POD_SOURCE] },
    },
  },
  {
    id: 'single:pod-otel',
    group: SINGLE_FIELD,
    label: 'Pod by k8s.pod.uid · OpenTelemetry',
    note: 'The simplest identity: STATS groups by one field, id is "k8s.pod:<uid>". No documentsFilter; the generator derives the presence filter.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'k8s.pod.uid' },
      dynamic: { sources: [OTEL_POD_SOURCE] },
    },
  },
  {
    id: 'single:pod-ecs',
    group: SINGLE_FIELD,
    label: 'Pod by kubernetes.pod.uid · Elastic Agent',
    note: 'One field over two sources of the same convention; the state_pod source adds the phase.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'kubernetes.pod.uid' },
      dynamic: { sources: [ECS_POD_SOURCE, ECS_STATE_POD_SOURCE] },
    },
  },
  {
    id: 'single:node-otel',
    group: SINGLE_FIELD,
    label: 'Node by k8s.node.name · OpenTelemetry',
    note: 'Nodes are named, not UID-ed, in kubeletstats.',
    outcome: 'servable',
    definition: {
      type: 'k8s.node',
      name: 'Node',
      identityField: { singleField: 'k8s.node.name' },
      dynamic: { sources: [OTEL_CLUSTER_SOURCE] },
    },
  },
  {
    id: 'single:node-ecs',
    group: SINGLE_FIELD,
    label: 'Node by kubernetes.node.name · Elastic Agent',
    note: 'Elastic Agent node metrics; the cluster name comes from orchestrator.cluster.name.',
    outcome: 'servable',
    definition: {
      type: 'k8s.node',
      name: 'Node',
      identityField: { singleField: 'kubernetes.node.name' },
      dynamic: { sources: [ECS_NODE_SOURCE] },
    },
  },
  {
    id: 'ranked-single:pod-otel',
    group: RANKED_SINGLE,
    label: 'Pod by [k8s.pod.uid] · OpenTelemetry',
    note: 'The ranking form of "Pod by k8s.pod.uid": same ids, but documentsFilter is spelled out.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: { branches: [{ ranking: [[{ field: 'k8s.pod.uid' }]] }] },
        documentsFilter: present('k8s.pod.uid'),
      },
      dynamic: { sources: [OTEL_POD_SOURCE] },
    },
  },
  {
    id: 'fallback:pod-otel-first',
    group: RANKED_FALLBACK,
    label: 'Pod by k8s.pod.uid › kubernetes.pod.uid · OTel + Agent',
    note: 'The registered k8s.pod: a document with k8s.pod.uid uses it, else kubernetes.pod.uid. Same UID under both, so one pod is one entity.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [{ ranking: [[{ field: 'k8s.pod.uid' }], [{ field: 'kubernetes.pod.uid' }]] }],
        },
        documentsFilter: { or: [present('k8s.pod.uid'), present('kubernetes.pod.uid')] },
      },
      dynamic: { sources: [OTEL_POD_SOURCE, ECS_POD_SOURCE, ECS_STATE_POD_SOURCE] },
    },
  },
  {
    id: 'fallback:pod-agent-first',
    group: RANKED_FALLBACK,
    label: 'Pod by kubernetes.pod.uid › k8s.pod.uid · Agent first',
    note: 'The same ranking reversed. Ids match the OTel-first order here, since no document carries both fields.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [{ ranking: [[{ field: 'kubernetes.pod.uid' }], [{ field: 'k8s.pod.uid' }]] }],
        },
        documentsFilter: { or: [present('kubernetes.pod.uid'), present('k8s.pod.uid')] },
      },
      dynamic: { sources: [ECS_POD_SOURCE, ECS_STATE_POD_SOURCE, OTEL_POD_SOURCE] },
    },
  },
  {
    id: 'fallback:node',
    group: RANKED_FALLBACK,
    label: 'Node by k8s.node.name › kubernetes.node.name · OTel + Agent',
    note: 'Node names from both conventions; the same node under both is one entity.',
    outcome: 'servable',
    definition: {
      type: 'k8s.node',
      name: 'Node',
      identityField: {
        euidRanking: {
          branches: [
            { ranking: [[{ field: 'k8s.node.name' }], [{ field: 'kubernetes.node.name' }]] },
          ],
        },
        documentsFilter: { or: [present('k8s.node.name'), present('kubernetes.node.name')] },
      },
      dynamic: { sources: [OTEL_CLUSTER_SOURCE, ECS_NODE_SOURCE] },
    },
  },
  {
    id: 'fallback:namespace',
    group: RANKED_FALLBACK,
    label: 'Namespace by k8s.namespace.name › kubernetes.namespace · OTel + Agent',
    note: 'Namespaces with running pods. Names repeat across clusters, so two clusters\' "default" are one entity.',
    outcome: 'servable',
    definition: {
      type: 'k8s.namespace',
      name: 'Namespace',
      identityField: {
        euidRanking: {
          branches: [
            { ranking: [[{ field: 'k8s.namespace.name' }], [{ field: 'kubernetes.namespace' }]] },
          ],
        },
        documentsFilter: { or: [present('k8s.namespace.name'), present('kubernetes.namespace')] },
      },
      dynamic: { sources: [OTEL_CLUSTER_SOURCE, ECS_POD_CLUSTER_SOURCE] },
    },
  },
  {
    id: 'tuple-sep:namespace-otel',
    group: TUPLE_WITH_SEP,
    label: 'Namespace by k8s.cluster.name / k8s.namespace.name · OTel',
    note: 'A tuple keeps namespaces of different clusters apart; documents without a cluster name have no id and are skipped.',
    outcome: 'servable',
    definition: {
      type: 'k8s.namespace',
      name: 'Namespace',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [{ field: 'k8s.cluster.name' }, { sep: '/' }, { field: 'k8s.namespace.name' }],
              ],
            },
          ],
        },
        documentsFilter: { and: [present('k8s.cluster.name'), present('k8s.namespace.name')] },
      },
      dynamic: { sources: [OTEL_EXISTENCE_SOURCE] },
    },
  },
  {
    id: 'tuple-sep:namespace-ecs',
    group: TUPLE_WITH_SEP,
    label: 'Namespace by orchestrator.cluster.name / kubernetes.namespace · Agent',
    note: 'The Elastic Agent tuple. No attribute may read orchestrator.cluster.name, since it is now an identity field.',
    outcome: 'servable',
    definition: {
      type: 'k8s.namespace',
      name: 'Namespace',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [
                  { field: 'orchestrator.cluster.name' },
                  { sep: '/' },
                  { field: 'kubernetes.namespace' },
                ],
              ],
            },
          ],
        },
        documentsFilter: {
          and: [present('orchestrator.cluster.name'), present('kubernetes.namespace')],
        },
      },
      dynamic: { sources: [ECS_POD_EXISTENCE_SOURCE] },
    },
  },
  {
    id: 'tuple-sep:namespace-both',
    group: TUPLE_WITH_SEP,
    label: 'Namespace by OTel tuple › Agent tuple · both',
    note: 'Two ranked tuples: the presence filter ORs one AND per composition.',
    outcome: 'servable',
    definition: {
      type: 'k8s.namespace',
      name: 'Namespace',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [{ field: 'k8s.cluster.name' }, { sep: '/' }, { field: 'k8s.namespace.name' }],
                [
                  { field: 'orchestrator.cluster.name' },
                  { sep: '/' },
                  { field: 'kubernetes.namespace' },
                ],
              ],
            },
          ],
        },
        documentsFilter: {
          or: [
            { and: [present('k8s.cluster.name'), present('k8s.namespace.name')] },
            { and: [present('orchestrator.cluster.name'), present('kubernetes.namespace')] },
          ],
        },
      },
      dynamic: { sources: [OTEL_EXISTENCE_SOURCE, ECS_POD_EXISTENCE_SOURCE] },
    },
  },
  {
    id: 'tuple-nosep:pod-ecs',
    group: TUPLE_WITHOUT_SEP,
    label: 'Pod by kubernetes.namespace + kubernetes.pod.name · Agent',
    note: 'Fields concatenated with nothing between: ("ab", "c") and ("a", "bc") give one id. raw_groups > count in the Count step shows such a collision.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [
            { ranking: [[{ field: 'kubernetes.namespace' }, { field: 'kubernetes.pod.name' }]] },
          ],
        },
        documentsFilter: {
          and: [present('kubernetes.namespace'), present('kubernetes.pod.name')],
        },
      },
      dynamic: {
        sources: [
          {
            indexPattern: 'metrics-kubernetes.pod-*',
            attributes: [
              { name: 'k8s.node.name', field: 'kubernetes.node.name' },
              { name: 'kubernetes.pod.uid', field: 'kubernetes.pod.uid' },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'suffix:node-ecs',
    group: LITERAL_SUFFIX,
    label: 'Node by kubernetes.node.name + "@agent" · Agent',
    note: 'A separator part may end a composition: a literal suffix in the id ("k8s.node:<name>@agent"). It may not start one; see the compile-time rejections.',
    outcome: 'servable',
    definition: {
      type: 'k8s.node',
      name: 'Node',
      identityField: {
        euidRanking: {
          branches: [{ ranking: [[{ field: 'kubernetes.node.name' }, { sep: '@agent' }]] }],
        },
        documentsFilter: present('kubernetes.node.name'),
      },
      dynamic: { sources: [ECS_NODE_SOURCE] },
    },
  },
  {
    id: 'mixed:namespace-otel',
    group: MIXED,
    label: 'Namespace by cluster / name › name · OTel',
    note: 'A tuple first, a single field as fallback: documents without a cluster name still get an id, by name alone.',
    outcome: 'servable',
    definition: {
      type: 'k8s.namespace',
      name: 'Namespace',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [{ field: 'k8s.cluster.name' }, { sep: '/' }, { field: 'k8s.namespace.name' }],
                [{ field: 'k8s.namespace.name' }],
              ],
            },
          ],
        },
        documentsFilter: {
          or: [
            { and: [present('k8s.cluster.name'), present('k8s.namespace.name')] },
            present('k8s.namespace.name'),
          ],
        },
      },
      dynamic: { sources: [OTEL_EXISTENCE_SOURCE] },
    },
  },
  {
    id: 'max:pod-8-fields',
    group: MAX_FIELDS,
    label: 'Pod by 4 ranked pairs (8 distinct fields)',
    note: 'The most distinct identity fields a dynamic definition may group by; one more is rejected.',
    outcome: 'servable',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [{ field: 'k8s.cluster.name' }, { sep: '/' }, { field: 'k8s.pod.uid' }],
                [{ field: 'k8s.namespace.name' }, { sep: '/' }, { field: 'k8s.pod.name' }],
                [{ field: 'orchestrator.cluster.name' }, { sep: '/' }, { field: 'kubernetes.pod.uid' }],
                [{ field: 'kubernetes.namespace' }, { sep: '/' }, { field: 'kubernetes.pod.name' }],
              ],
            },
          ],
        },
        documentsFilter: {
          or: [
            { and: [present('k8s.cluster.name'), present('k8s.pod.uid')] },
            { and: [present('k8s.namespace.name'), present('k8s.pod.name')] },
            { and: [present('orchestrator.cluster.name'), present('kubernetes.pod.uid')] },
            { and: [present('kubernetes.namespace'), present('kubernetes.pod.name')] },
          ],
        },
      },
      dynamic: { sources: [OTEL_EXISTENCE_SOURCE, ECS_POD_EXISTENCE_SOURCE] },
    },
  },
];

// ---------- rejected ----------

const POD_UID_RANKING = {
  euidRanking: { branches: [{ ranking: [[{ field: 'kubernetes.pod.uid' }]] }] },
  documentsFilter: present('kubernetes.pod.uid'),
};

const REJECTED: DefinitionPreset[] = [
  {
    id: 'rejected:skip-type-prepend',
    group: REJECTED_RULES,
    label: 'skipTypePrepend: true',
    note: 'Inventory ids always keep the "<type>:" prefix.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'kubernetes.pod.uid', skipTypePrepend: true },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:field-evaluations',
    group: REJECTED_RULES,
    label: 'fieldEvaluations',
    note: 'The inventory groups on raw fields and never computes a field per document before the id.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        ...POD_UID_RANKING,
        fieldEvaluations: [
          {
            destination: 'entity.namespace',
            sources: [{ field: 'data_stream.dataset' }],
            fallbackValue: null,
            whenClauses: [],
          },
        ],
      },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:two-branches',
    group: REJECTED_RULES,
    label: 'Two ranking branches',
    note: 'The inventory serves exactly one branch; a second one would need a per-document CASE.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [
            { ranking: [[{ field: 'k8s.pod.uid' }]] },
            { ranking: [[{ field: 'kubernetes.pod.uid' }]] },
          ],
        },
        documentsFilter: { or: [present('k8s.pod.uid'), present('kubernetes.pod.uid')] },
      },
      dynamic: { sources: [OTEL_POD_SOURCE, ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:branch-when',
    group: REJECTED_RULES,
    label: 'Branch with when',
    note: 'The one branch must be unconditional.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [
            {
              when: { field: 'data_stream.dataset', eq: 'kubernetes.pod' },
              ranking: [[{ field: 'kubernetes.pod.uid' }]],
            },
          ],
        },
        documentsFilter: present('kubernetes.pod.uid'),
      },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:wildcard-field',
    group: REJECTED_RULES,
    label: 'Wildcard identity field',
    note: 'Identity fields must be literal paths: the inventory groups on raw mapped fields.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'kubernetes.pod.*' },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:last-seen',
    group: REJECTED_RULES,
    label: 'last_seen as identity field',
    note: 'last_seen is the inventory\'s own output column.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'last_seen' },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:documents-filter',
    group: REJECTED_RULES,
    label: 'documentsFilter not the presence filter',
    note: 'An exists-only filter lets "" through; the filter must be exactly the presence filter of the ranking.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: { branches: [{ ranking: [[{ field: 'kubernetes.pod.uid' }]] }] },
        documentsFilter: { field: 'kubernetes.pod.uid', exists: true },
      },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:nine-fields',
    group: REJECTED_RULES,
    label: '9 identity fields',
    note: 'One more than the 8-field maximum.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [{ field: 'k8s.cluster.name' }, { sep: '/' }, { field: 'k8s.pod.uid' }],
                [{ field: 'k8s.namespace.name' }, { sep: '/' }, { field: 'k8s.pod.name' }],
                [{ field: 'orchestrator.cluster.name' }, { sep: '/' }, { field: 'kubernetes.pod.uid' }],
                [{ field: 'kubernetes.namespace' }, { sep: '/' }, { field: 'kubernetes.pod.name' }],
                [{ field: 'kubernetes.pod.ip' }],
              ],
            },
          ],
        },
        documentsFilter: {
          or: [
            { and: [present('k8s.cluster.name'), present('k8s.pod.uid')] },
            { and: [present('k8s.namespace.name'), present('k8s.pod.name')] },
            { and: [present('orchestrator.cluster.name'), present('kubernetes.pod.uid')] },
            { and: [present('kubernetes.namespace'), present('kubernetes.pod.name')] },
            present('kubernetes.pod.ip'),
          ],
        },
      },
      dynamic: { sources: [OTEL_EXISTENCE_SOURCE, ECS_POD_EXISTENCE_SOURCE] },
    },
  },
  {
    id: 'rejected:attribute-reads-identity',
    group: REJECTED_RULES,
    label: 'Attribute reads an identity field',
    note: 'Every row already carries its identity fields, so an attribute may not read one.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'kubernetes.pod.uid' },
      dynamic: {
        sources: [
          {
            indexPattern: 'metrics-kubernetes.pod-*',
            attributes: [{ name: 'uid', field: 'kubernetes.pod.uid' }],
          },
        ],
      },
    },
  },
  {
    id: 'rejected:both-variants',
    group: REJECTED_SCHEMA,
    label: 'singleField and euidRanking together',
    note: 'Both identity variants are strict objects, so keys of both fail each variant.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: { singleField: 'kubernetes.pod.uid', ...POD_UID_RANKING },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:separator-only',
    group: REJECTED_SCHEMA,
    label: 'Composition with only a separator',
    note: 'Each composition needs at least one field part.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: { branches: [{ ranking: [[{ sep: '/' }]] }] },
        documentsFilter: { always: {} },
      },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
  {
    id: 'rejected:empty-ranking',
    group: REJECTED_SCHEMA,
    label: 'Empty ranking',
    note: 'A branch needs at least one composition.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.pod',
      name: 'Pod',
      identityField: {
        euidRanking: { branches: [{ ranking: [] }] },
        documentsFilter: { always: {} },
      },
      dynamic: { sources: [ECS_POD_SOURCE] },
    },
  },
];

// The schema and the inventory rules accept these; the store's ES|QL id compiler does not.
const REJECTED_AT_COMPILE: DefinitionPreset[] = [
  {
    id: 'compile:leading-separator',
    group: REJECTED_COMPILE,
    label: 'Leading separator: "node-" + kubernetes.node.name',
    note: 'Passes the schema and every inventory rule, then fails in resolveIdentityPlan: the id compiler rejects a composition that starts with a separator.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.node',
      name: 'Node',
      identityField: {
        euidRanking: {
          branches: [{ ranking: [[{ sep: 'node-' }, { field: 'kubernetes.node.name' }]] }],
        },
        documentsFilter: present('kubernetes.node.name'),
      },
      dynamic: { sources: [ECS_NODE_SOURCE] },
    },
  },
  {
    id: 'compile:leading-separator-ranked',
    group: REJECTED_COMPILE,
    label: 'Leading separator in ranked compositions',
    note: 'The same with two ranked compositions; the compiler reports it differently but still rejects it.',
    outcome: 'rejected',
    definition: {
      type: 'k8s.node',
      name: 'Node',
      identityField: {
        euidRanking: {
          branches: [
            {
              ranking: [
                [{ sep: 'otel-' }, { field: 'k8s.node.name' }],
                [{ sep: 'agent-' }, { field: 'kubernetes.node.name' }],
              ],
            },
          ],
        },
        documentsFilter: { or: [present('k8s.node.name'), present('kubernetes.node.name')] },
      },
      dynamic: { sources: [OTEL_CLUSTER_SOURCE, ECS_NODE_SOURCE] },
    },
  },
];

/** Every preset, servable first, in dropdown order. */
export const DEFINITION_PRESETS: readonly DefinitionPreset[] = [
  ...SERVABLE,
  ...REJECTED,
  ...REJECTED_AT_COMPILE,
];
