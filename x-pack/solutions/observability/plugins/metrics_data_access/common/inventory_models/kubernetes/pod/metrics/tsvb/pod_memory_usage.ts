/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { TSVBMetricModelCreator, TSVBMetricModel } from '../../../../types';

export const podMemoryUsage: TSVBMetricModelCreator = (
  timeField,
  indexPattern,
  interval,
  schema
): TSVBMetricModel => {
  const fields =
    schema === 'semconv'
      ? {
          withLimit: 'metrics.k8s.pod.memory_limit_utilization',
          withoutLimit: 'metrics.k8s.pod.memory.node.utilization',
        }
      : {
          withLimit: 'kubernetes.pod.memory.usage.limit.pct',
          withoutLimit: 'kubernetes.pod.memory.usage.node.pct',
        };

  return {
    id: 'podMemoryUsage',
    requires: ['kubernetes.pod'],
    index_pattern: indexPattern,
    interval,
    time_field: timeField,
    type: 'timeseries',
    series: [
      {
        id: 'memory',
        split_mode: 'everything',
        metrics: [
          {
            field: fields.withoutLimit,
            id: 'avg-memory-without',
            type: 'avg',
          },
          {
            field: fields.withLimit,
            id: 'avg-memory-with',
            type: 'avg',
          },
          {
            id: 'memory-usage',
            type: 'calculation',
            variables: [
              { id: 'memory_with', name: 'with_limit', field: 'avg-memory-with' },
              { id: 'memory_without', name: 'without_limit', field: 'avg-memory-without' },
            ],
            script:
              '(params.with_limit != null && params.with_limit > 0.0) ? params.with_limit : params.without_limit',
            gap_policy: 'insert_zeros',
          },
        ],
      },
    ],
  };
};
