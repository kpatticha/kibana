/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as t from 'io-ts';
import { getApmEventClient } from '../../lib/helpers/get_apm_event_client';
import { createApmServerRoute } from '../apm_routes/create_apm_server_route';
import { environmentRt, kueryRt, rangeRt } from '../default_api_types';
import { getHttpRequestsChart } from './get_http_requests_chart';
import { getMobileFilters } from './get_mobile_filters';
import { getSessionsChart } from './get_sessions_chart';
import { getMobileStats, MobileStats } from './get_mobile_stats';

const mobileFiltersRoute = createApmServerRoute({
  endpoint: 'GET /internal/apm/services/{serviceName}/mobile/filters',
  params: t.type({
    path: t.type({
      serviceName: t.string,
    }),
    query: t.intersection([
      kueryRt,
      rangeRt,
      environmentRt,
      t.partial({
        transactionType: t.string,
      }),
    ]),
  }),
  options: { tags: ['access:apm'] },
  handler: async (
    resources
  ): Promise<{
    mobileFilters: Awaited<ReturnType<typeof getMobileFilters>>;
  }> => {
    const apmEventClient = await getApmEventClient(resources);
    const { params } = resources;
    const { serviceName } = params.path;
    const { kuery, environment, start, end, transactionType } = params.query;

    const filters = await getMobileFilters({
      kuery,
      environment,
      transactionType,
      start,
      end,
      serviceName,
      apmEventClient,
    });
    return { mobileFilters: filters };
  },
});

const mobileStatsRoute = createApmServerRoute({
  endpoint: 'GET /internal/apm/mobile-services/{serviceName}/stats',
  params: t.type({
    path: t.type({
      serviceName: t.string,
    }),
    query: t.intersection([
      kueryRt,
      rangeRt,
      environmentRt,
      t.partial({
        transactionType: t.string,
      }),
    ]),
  }),
  options: { tags: ['access:apm'] },
  handler: async (resources): Promise<MobileStats> => {
    const apmEventClient = await getApmEventClient(resources);
    const { params } = resources;
    const { serviceName } = params.path;
    const { kuery, environment, start, end, transactionType } = params.query;

    const stats = await getMobileStats({
      kuery,
      environment,
      transactionType,
      start,
      end,
      serviceName,
      apmEventClient,
    });

    return stats;
  },
});

const sessionsChartRoute = createApmServerRoute({
  endpoint:
    'GET /internal/apm/mobile-services/{serviceName}/transactions/charts/sessions',
  params: t.type({
    path: t.type({
      serviceName: t.string,
    }),
    query: t.intersection([
      kueryRt,
      rangeRt,
      environmentRt,
      t.partial({
        transactionType: t.string,
        transactionName: t.string,
      }),
    ]),
  }),
  options: { tags: ['access:apm'] },
  handler: async (resources) => {
    const apmEventClient = await getApmEventClient(resources);
    const { params } = resources;
    const { serviceName } = params.path;
    const { kuery, environment, start, end, transactionType, transactionName } =
      params.query;

    const { timeseries } = await getSessionsChart({
      kuery,
      environment,
      transactionType,
      transactionName,
      start,
      end,
      serviceName,
      apmEventClient,
    });

    return { timeseries };
  },
});

const httpRequestsChartRoute = createApmServerRoute({
  endpoint:
    'GET /internal/apm/mobile-services/{serviceName}/transactions/charts/http_requests',
  params: t.type({
    path: t.type({
      serviceName: t.string,
    }),
    query: t.intersection([
      kueryRt,
      rangeRt,
      environmentRt,
      t.partial({
        transactionType: t.string,
        transactionName: t.string,
      }),
    ]),
  }),
  options: { tags: ['access:apm'] },
  handler: async (resources) => {
    const apmEventClient = await getApmEventClient(resources);
    const { params } = resources;
    const { serviceName } = params.path;
    const { kuery, environment, start, end, transactionType, transactionName } =
      params.query;

    const { timeseries } = await getHttpRequestsChart({
      kuery,
      environment,
      transactionType,
      transactionName,
      start,
      end,
      serviceName,
      apmEventClient,
    });

    return { timeseries };
  },
});

export const mobileRouteRepository = {
  ...mobileFiltersRoute,
  ...sessionsChartRoute,
  ...httpRequestsChartRoute,
  ...mobileStatsRoute,
};
