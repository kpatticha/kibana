/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { ENVIRONMENT_ALL } from '@kbn/apm-plugin/common/environment_filter_values';
import { FtrProviderContext } from '../../common/ftr_provider_context';
import { generateMobileData } from './generate_mobile_data';

export default function ApiTest({ getService }: FtrProviderContext) {
  const apmApiClient = getService('apmApiClient');
  const registry = getService('registry');
  const synthtraceEsClient = getService('synthtraceEsClient');

  const start = new Date('2023-01-01T00:00:00.000Z').getTime();
  const end = new Date('2023-01-01T02:00:00.000Z').getTime();

  async function getSessionsChart({
    environment = ENVIRONMENT_ALL.value,
    kuery = '',
    serviceName,
    transactionType = 'mobile',
  }: {
    environment?: string;
    kuery?: string;
    serviceName: string;
    transactionType?: string;
  }) {
    return await apmApiClient.readUser({
      endpoint: 'GET /internal/apm/mobile-services/{serviceName}/transactions/charts/sessions',
      params: {
        path: { serviceName },
        query: {
          environment,
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          kuery,
          transactionType,
        },
      },
    });
  }

  registry.when('without data loaded', { config: 'basic', archives: [] }, () => {
    describe('when no data', () => {
      it('handles empty state', async () => {
        const response = await getSessionsChart({ serviceName: 'foo' });
        expect(response.body.currentPeriod).to.eql([]);
        expect(response.status).to.be(200);
      });
    });
  });

  registry.when('with data loaded', { config: 'basic', archives: [] }, () => {
    before(async () => {
      await generateMobileData({
        synthtraceEsClient,
        start,
        end,
      });
    });

    after(() => synthtraceEsClient.clean());

    describe('when data is loaded', () => {
      it('returns timeseries for sessions chart', async () => {
        const response = await getSessionsChart({ serviceName: 'synth-android' });

        expect(response.status).to.be(200);
        expect(
          response.body.currentPeriod.some(
            (item: { x: number; y: number | null }) => item.x && item.y
          )
        ).to.equal(true);
        expect(response.body.currentPeriod[0].y).to.equal(3);
      });
    });

    describe('when filters are applied', () => {
      it('returns empty state for filters', async () => {
        const response = await getSessionsChart({
          serviceName: 'synth-android',
          environment: 'production',
          kuery: `app.version:"none"`,
        });

        expect(response.body.currentPeriod).to.eql([]);
      });

      it('returns the correct values filter is applied', async () => {
        const response = await getSessionsChart({
          serviceName: 'synth-android',
          environment: 'production',
          kuery: `transaction.name : "Start View - View Appearing"`,
        });

        expect(response.status).to.be(200);
        expect(response.body.currentPeriod[0].y).to.equal(2);
      });
    });
  });
}
