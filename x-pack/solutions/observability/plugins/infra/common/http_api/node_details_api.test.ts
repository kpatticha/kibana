/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isRight } from 'fp-ts/Either';
import { NodeDetailsRequestRT } from './node_details_api';

const baseRequest = {
  nodeType: 'pod',
  nodeId: 'pod-uid-1',
  metrics: ['podCpuUsage'],
  timerange: { interval: '>=1m', to: 1757500000000, from: 1757496400000 },
  sourceId: 'default',
};

describe('NodeDetailsRequestRT', () => {
  it('decodes a request without schema (backwards compatible)', () => {
    expect(isRight(NodeDetailsRequestRT.decode(baseRequest))).toBe(true);
  });

  it('decodes a request with a valid schema', () => {
    expect(isRight(NodeDetailsRequestRT.decode({ ...baseRequest, schema: 'semconv' }))).toBe(true);
    expect(isRight(NodeDetailsRequestRT.decode({ ...baseRequest, schema: 'ecs' }))).toBe(true);
  });

  it('rejects an invalid schema value', () => {
    expect(isRight(NodeDetailsRequestRT.decode({ ...baseRequest, schema: 'otel' }))).toBe(false);
  });
});
