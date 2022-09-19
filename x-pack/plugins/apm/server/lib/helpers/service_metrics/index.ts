/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { kqlQuery, rangeQuery } from '@kbn/observability-plugin/server';
import { ProcessorEvent } from '@kbn/observability-plugin/common';
import {
  TRANSACTION_DURATION_SUMMARY,
  METRICSET_NAME
} from '../../../../common/elasticsearch_fieldnames';
import { APMConfig } from '../../..';
import { APMEventClient } from '../create_es_client/create_apm_event_client';

export async function getSearchAggregatedServiceMetrics({
  config,
  start,
  end,
  apmEventClient,
  kuery,
}: {
  config: APMConfig;
  start?: number;
  end?: number;
  apmEventClient: APMEventClient;
  kuery: string;
}): Promise<boolean> {

   if (config.searchAggregatedServiceMetrics) {
      return getHasAggregatedServicesMetrics({ start, end, apmEventClient, kuery })
   }

   return false;

}

export async function getHasAggregatedServicesMetrics({
  start,
  end,
  apmEventClient,
  kuery,
}: {
  start?: number;
  end?: number;
  apmEventClient: APMEventClient;
  kuery: string;
}) {
  const response = await apmEventClient.search(
    'get_has_aggregated_service_metrics',
    {
      apm: {
        events: [ProcessorEvent.metric],
      },
      body: {
        size: 1,
        query: {
          bool: {
            filter: [
              { exists: { field: TRANSACTION_DURATION_SUMMARY } },
              { term: { [METRICSET_NAME]: 'service'}},
              ...(start && end ? rangeQuery(start, end) : []),
              ...kqlQuery(kuery),
            ],
          },
        },
      },
      terminate_after: 1,
    }
  );

  return response.hits.total.value > 0;
}