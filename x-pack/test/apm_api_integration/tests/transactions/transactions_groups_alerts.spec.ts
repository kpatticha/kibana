/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { APIReturnType } from '@kbn/apm-plugin/public/services/rest/create_call_apm_api';
import { LatencyAggregationType } from '@kbn/apm-plugin/common/latency_aggregation_types';
import { ApmDocumentType, ApmTransactionDocumentType } from '@kbn/apm-plugin/common/document_type';
import { RollupInterval } from '@kbn/apm-plugin/common/rollup';
import { apm, timerange } from '@kbn/apm-synthtrace-client';
import { AggregationType, ApmRuleType } from '@kbn/apm-plugin/common/rules/apm_rule_types';
import { FtrProviderContext } from '../../common/ftr_provider_context';
import { createApmRule } from '../alerts/alerting_api_helper';
import { waitForActiveAlert } from '../../common/utils/wait_for_active_alert';

type TransactionsGroupsMainStatistics =
  APIReturnType<'GET /internal/apm/services/{serviceName}/transactions/groups/main_statistics'>;

export default function ApiTest({ getService }: FtrProviderContext) {
  const registry = getService('registry');
  const apmApiClient = getService('apmApiClient');
  const synthtraceEsClient = getService('synthtraceEsClient');
  const supertest = getService('supertest');
  const esClient = getService('es');
  const log = getService('log');
  const serviceName = 'synth-go';
  const start = Date.now() - 24 * 60 * 60 * 1000;
  const end = Date.now();

  async function getTransactionGroups(overrides?: {
    path?: {
      serviceName?: string;
    };
    query?: {
      start?: string;
      end?: string;
      transactionType?: string;
      environment?: string;
      kuery?: string;
      latencyAggregationType?: LatencyAggregationType;
      documentType?: ApmTransactionDocumentType;
      rollupInterval?: RollupInterval;
      useDurationSummary?: boolean;
    };
  }) {
    const response = await apmApiClient.readUser({
      endpoint: 'GET /internal/apm/services/{serviceName}/transactions/groups/main_statistics',
      params: {
        path: { serviceName },
        query: {
          start: new Date(start).toISOString(),
          end: new Date(end + 5 * 60 * 1000).toISOString(),
          latencyAggregationType: LatencyAggregationType.avg,
          transactionType: 'request',
          environment: 'ENVIRONMENT_ALL',
          useDurationSummary: false,
          kuery: '',
          documentType: ApmDocumentType.TransactionMetric,
          rollupInterval: RollupInterval.SixtyMinutes,
          ...overrides?.query,
        },
      },
    });
    expect(response.status).to.be(200);
    return response.body as TransactionsGroupsMainStatistics;
  }

  registry.when('when data is loaded', { config: 'basic', archives: [] }, () => {
    describe('Alerts', () => {
      const transactions = [
        {
          name: 'GET /api/task/avg',
          duration: 100,
          type: 'task',
        },
        {
          name: 'GET /api/request/avg',
          duration: 100,
          type: 'request',
        },
        {
          name: 'GET /api/request/p99',
          duration: 100,
          type: 'request',
        },
        {
          name: 'GET /api/request/p95',
          duration: 100,
          type: 'request',
        },
        {
          name: 'GET /api/failed/request',
          duration: 100,
          type: 'request',
        },
      ];
      before(async () => {
        const serviceGoProdInstance = apm
          .service({ name: serviceName, environment: 'production', agentName: 'go' })
          .instance('instance-a');

        await synthtraceEsClient.index([
          timerange(start, end)
            .interval('1m')
            .rate(5)
            .generator((timestamp) => {
              return transactions.map(({ name, duration, type }) => {
                return serviceGoProdInstance
                  .transaction({ transactionName: name, transactionType: type })
                  .timestamp(timestamp)
                  .duration(duration)
                  .success();
              });
            }),
          timerange(start, end)
            .interval('1m')
            .rate(1)
            .generator((timestamp) => {
              return transactions.map(({ name, duration, type }) => {
                return serviceGoProdInstance
                  .transaction({ transactionName: name, transactionType: type })
                  .timestamp(timestamp)
                  .duration(duration)
                  .failure();
              });
            }),
        ]);
      });

      after(() => synthtraceEsClient.clean());

      describe('Transaction groups with avg transaction duration alerts', () => {
        let ruleId: string;

        before(async () => {
          const createdRule = await createApmRule({
            supertest,
            name: `Latency threshold | ${serviceName}`,
            params: {
              serviceName,
              transactionType: 'request',
              transactionName: 'GET /api/request/avg',
              windowSize: 99,
              windowUnit: 'h',
              threshold: 99,
              aggregationType: AggregationType.Avg,
              environment: 'production',
            },
            ruleTypeId: ApmRuleType.TransactionDuration,
          });

          ruleId = createdRule.id;
          await waitForActiveAlert({ ruleId, esClient, log });
        });

        after(async () => {
          await supertest.delete(`/api/alerting/rule/${ruleId}`).set('kbn-xsrf', 'true');
          await esClient.deleteByQuery({ index: '.alerts*', query: { match_all: {} } });
        });

        it('returns the correct number of alert counts', async () => {
          const txGroupsTypeRequest = await getTransactionGroups({
            query: { transactionType: 'request' },
          });

          expect(txGroupsTypeRequest.hasActiveAlerts).to.be.equal(true);

          const expected = txGroupsTypeRequest.transactionGroups.map(({ name, alertsCount }) => ({
            name,
            alertsCount,
          }));

          expect(expected).to.eql([
            { name: 'GET /api/failed/request', alertsCount: 0 },
            { name: 'GET /api/request/p95', alertsCount: 0 },
            { name: 'GET /api/request/p99', alertsCount: 0 },
            { name: 'GET /api/request/avg', alertsCount: 1 },
          ]);
        });
      });

      describe('Transaction groups with p99 transaction duration alerts', () => {
        let ruleId: string;

        before(async () => {
          const createdRule = await createApmRule({
            supertest,
            name: `Latency threshold | ${serviceName}`,
            params: {
              serviceName,
              transactionType: 'request',
              transactionName: 'GET /api/request/p99',
              windowSize: 99,
              windowUnit: 'h',
              threshold: 10,
              aggregationType: AggregationType.P99,
              environment: 'production',
            },
            ruleTypeId: ApmRuleType.TransactionDuration,
          });

          ruleId = createdRule.id;
          await waitForActiveAlert({ ruleId, esClient, log });
        });

        after(async () => {
          await supertest.delete(`/api/alerting/rule/${ruleId}`).set('kbn-xsrf', 'true');
          await esClient.deleteByQuery({ index: '.alerts*', query: { match_all: {} } });
        });

        it('returns the correct number of alert counts', async () => {
          const txGroupsTypeRequest = await getTransactionGroups({
            query: {
              transactionType: 'request',
              latencyAggregationType: LatencyAggregationType.p99,
            },
          });

          expect(txGroupsTypeRequest.hasActiveAlerts).to.be.equal(true);

          const expected = txGroupsTypeRequest.transactionGroups.map(({ name, alertsCount }) => ({
            name,
            alertsCount,
          }));

          expect(expected).to.eql([
            { name: 'GET /api/failed/request', alertsCount: 0 },
            { name: 'GET /api/request/avg', alertsCount: 0 },
            { name: 'GET /api/request/p95', alertsCount: 0 },
            { name: 'GET /api/request/p99', alertsCount: 1 },
          ]);
        });
      });

      describe('Transaction groups with error rate alerts', () => {
        let ruleId: string;

        before(async () => {
          const createdRule = await createApmRule({
            supertest,
            name: `Error rate | ${serviceName}`,
            params: {
              serviceName,
              transactionType: 'request',
              transactionName: 'GET /api/failed/request',
              windowSize: 99,
              windowUnit: 'h',
              threshold: 5,
              environment: 'production',
            },
            ruleTypeId: ApmRuleType.TransactionErrorRate,
          });

          ruleId = createdRule.id;
          await waitForActiveAlert({ ruleId, esClient, log });
        });

        after(async () => {
          await supertest.delete(`/api/alerting/rule/${ruleId}`).set('kbn-xsrf', 'true');
          await esClient.deleteByQuery({ index: '.alerts*', query: { match_all: {} } });
        });

        it('returns the correct number of alert counts', async () => {
          const txGroupsTypeRequest = await getTransactionGroups({
            query: {
              transactionType: 'request',
              latencyAggregationType: LatencyAggregationType.p95,
            },
          });

          const expected = txGroupsTypeRequest.transactionGroups.map(({ name, alertsCount }) => ({
            name,
            alertsCount,
          }));

          expect(txGroupsTypeRequest.hasActiveAlerts).to.be.equal(true);

          expect(expected).to.eql([
            { name: 'GET /api/request/avg', alertsCount: 0 },
            { name: 'GET /api/request/p95', alertsCount: 0 },
            { name: 'GET /api/request/p99', alertsCount: 0 },
            { name: 'GET /api/failed/request', alertsCount: 1 },
          ]);
        });
      });

      describe('Transaction groups without alerts', () => {
        it('returns the correct number of alert counts', async () => {
          const txGroupsTypeTask = await getTransactionGroups({
            query: { transactionType: 'task' },
          });

          const expected = txGroupsTypeTask.transactionGroups.map(({ name, alertsCount }) => ({
            name,
            alertsCount,
          }));

          expect(txGroupsTypeTask.hasActiveAlerts).to.be.equal(false);

          expect(expected).to.eql([{ name: 'GET /api/task/avg', alertsCount: 0 }]);
        });
      });
    });
  });
}
