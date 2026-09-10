/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { pod } from '.';

describe('pod inventory model nodeFilter', () => {
  it('keeps the legacy kubernetes module filter when no schema is provided', () => {
    expect(pod.nodeFilter?.()).toEqual([{ term: { 'event.module': 'kubernetes' } }]);
  });

  it('filters on beats kubernetes modules for the ecs schema', () => {
    expect(pod.nodeFilter?.({ schema: 'ecs' })).toEqual([
      {
        bool: {
          should: [
            { term: { 'event.module': 'kubernetes' } },
            { term: { 'metricset.module': 'kubernetes' } },
          ],
          minimum_should_match: 1,
        },
      },
    ]);
  });

  it('filters on the kubeletstats otel dataset for the semconv schema', () => {
    expect(pod.nodeFilter?.({ schema: 'semconv' })).toEqual([
      {
        bool: {
          filter: [{ term: { 'data_stream.dataset': 'kubeletstatsreceiver.otel' } }],
        },
      },
    ]);
  });
});
