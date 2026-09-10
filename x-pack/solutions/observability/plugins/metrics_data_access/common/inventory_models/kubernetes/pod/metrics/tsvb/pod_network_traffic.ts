/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { TSVBMetricModelCreator, TSVBMetricModel, TSVBSeries } from '../../../../types';

const ecsSeries: TSVBSeries[] = [
  {
    id: 'tx',
    split_mode: 'everything',
    metrics: [
      {
        field: 'kubernetes.pod.network.tx.bytes',
        id: 'max-network-tx',
        type: 'max',
      },
      {
        field: 'max-network-tx',
        id: 'deriv-max-network-tx',
        type: 'derivative',
        unit: '1s',
      },
      {
        id: 'posonly-deriv-max-net-tx',
        type: 'calculation',
        variables: [{ id: 'var-rate', name: 'rate', field: 'deriv-max-network-tx' }],
        script: 'params.rate > 0.0 ? params.rate : 0.0',
      },
    ],
  },
  {
    id: 'rx',
    split_mode: 'everything',
    metrics: [
      {
        field: 'kubernetes.pod.network.rx.bytes',
        id: 'max-network-rx',
        type: 'max',
      },
      {
        field: 'max-network-rx',
        id: 'deriv-max-network-rx',
        type: 'derivative',
        unit: '1s',
      },
      {
        id: 'posonly-deriv-max-net-rx',
        type: 'calculation',
        variables: [{ id: 'var-rate', name: 'rate', field: 'deriv-max-network-rx' }],
        script: 'params.rate > 0.0 ? params.rate : 0.0',
      },
      {
        id: 'invert-posonly-deriv-max-network-rx',
        script: 'params.rate * -1',
        type: 'calculation',
        variables: [
          {
            field: 'posonly-deriv-max-net-rx',
            id: 'var-rate',
            name: 'rate',
          },
        ],
      },
    ],
  },
];

const semconvSeries: TSVBSeries[] = [
  {
    id: 'tx',
    split_mode: 'terms',
    terms_field: 'interface',
    filter: { language: 'kuery', query: 'direction : "transmit"' },
    metrics: [
      {
        field: 'metrics.k8s.pod.network.io',
        id: 'max-network-tx',
        type: 'max',
      },
      {
        field: 'max-network-tx',
        id: 'deriv-max-network-tx',
        type: 'derivative',
        unit: '1s',
      },
      {
        id: 'posonly-deriv-max-net-tx',
        type: 'calculation',
        variables: [{ id: 'var-rate', name: 'rate', field: 'deriv-max-network-tx' }],
        script: 'params.rate > 0.0 ? params.rate : 0.0',
      },
      {
        id: 'seriesagg-sum-tx',
        type: 'series_agg',
        function: 'sum',
      },
    ],
  },
  {
    id: 'rx',
    split_mode: 'terms',
    terms_field: 'interface',
    filter: { language: 'kuery', query: 'direction : "receive"' },
    metrics: [
      {
        field: 'metrics.k8s.pod.network.io',
        id: 'max-network-rx',
        type: 'max',
      },
      {
        field: 'max-network-rx',
        id: 'deriv-max-network-rx',
        type: 'derivative',
        unit: '1s',
      },
      {
        id: 'posonly-deriv-max-net-rx',
        type: 'calculation',
        variables: [{ id: 'var-rate', name: 'rate', field: 'deriv-max-network-rx' }],
        script: 'params.rate > 0.0 ? params.rate : 0.0',
      },
      {
        id: 'invert-posonly-deriv-max-network-rx',
        script: 'params.rate * -1',
        type: 'calculation',
        variables: [{ field: 'posonly-deriv-max-net-rx', id: 'var-rate', name: 'rate' }],
      },
      {
        id: 'seriesagg-sum-rx',
        type: 'series_agg',
        function: 'sum',
      },
    ],
  },
];

export const podNetworkTraffic: TSVBMetricModelCreator = (
  timeField,
  indexPattern,
  interval,
  schema
): TSVBMetricModel => ({
  id: 'podNetworkTraffic',
  requires: ['kubernetes.pod'],
  index_pattern: indexPattern,
  interval,
  time_field: timeField,
  type: 'timeseries',
  series: schema === 'semconv' ? semconvSeries : ecsSeries,
});
