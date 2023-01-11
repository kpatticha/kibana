/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ProcessorEvent } from '@kbn/observability-plugin/common';
import {
  kqlQuery,
  rangeQuery,
  termQuery,
} from '@kbn/observability-plugin/server';
import {
  SERVICE_NAME,
  TRANSACTION_TYPE,
  SESSION_ID,
  TRANSACTION_NAME,
} from '../../../common/es_fields/apm';
import { environmentQuery } from '../../../common/utils/environment_query';
import { APMEventClient } from '../../lib/helpers/create_es_client/create_apm_event_client';
import { getBucketSize } from '../../lib/helpers/get_bucket_size';

export async function getSessionsChart({
  kuery,
  apmEventClient,
  serviceName,
  transactionType,
  transactionName,
  environment,
  start,
  end,
}: {
  kuery: string;
  apmEventClient: APMEventClient;
  serviceName: string;
  transactionType?: string;
  transactionName?: string;
  environment: string;
  start: number;
  end: number;
}) {
  const { intervalString } = getBucketSize({
    start,
    end,
    minBucketSize: 60,
  });

  const response = await apmEventClient.search('get_sessions_chart', {
    apm: { events: [ProcessorEvent.transaction] },
    body: {
      track_total_hits: false,
      size: 0,
      query: {
        bool: {
          filter: [
            { exists: { field: SESSION_ID } },
            ...termQuery(SERVICE_NAME, serviceName),
            ...termQuery(TRANSACTION_TYPE, transactionType),
            ...termQuery(TRANSACTION_NAME, transactionName),
            ...rangeQuery(start, end),
            ...environmentQuery(environment),
            ...kqlQuery(kuery),
          ],
        },
      },
      aggs: {
        timeseries: {
          date_histogram: {
            field: '@timestamp',
            fixed_interval: intervalString,
            min_doc_count: 0,
          },
          aggs: {
            sessions: {
              cardinality: { field: SESSION_ID },
            },
          },
        },
      },
    },
  });

  return {
    timeseries:
      response?.aggregations?.timeseries.buckets.map((bucket) => {
        return {
          x: bucket.key,
          y: bucket.doc_count ?? 0,
        };
      }) ?? [],
  };
}
