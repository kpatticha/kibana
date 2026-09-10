/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { TSVBMetricModelCreator, TSVBMetricModel } from '../../../../types';

export const podCpuUsage: TSVBMetricModelCreator = (
  timeField,
  indexPattern,
  interval,
  schema
): TSVBMetricModel => {
  const fields =
    schema === 'semconv'
      ? {
          withLimit: 'metrics.k8s.pod.cpu_limit_utilization',
          withoutLimit: 'metrics.k8s.pod.cpu.node.utilization',
        }
      : {
          withLimit: 'kubernetes.pod.cpu.usage.limit.pct',
          withoutLimit: 'kubernetes.pod.cpu.usage.node.pct',
        };

  return {
    id: 'podCpuUsage',
    requires: ['kubernetes.pod'],
    index_pattern: indexPattern,
    interval,
    time_field: timeField,
    type: 'timeseries',
    series: [
      {
        id: 'cpu',
        split_mode: 'everything',
        metrics: [
          {
            field: fields.withoutLimit,
            id: 'avg-cpu-without',
            type: 'avg',
          },
          {
            field: fields.withLimit,
            id: 'avg-cpu-with',
            type: 'avg',
          },
          {
            id: 'cpu-usage',
            type: 'calculation',
            variables: [
              { id: 'cpu_with', name: 'with_limit', field: 'avg-cpu-with' },
              { id: 'cpu_without', name: 'without_limit', field: 'avg-cpu-without' },
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
