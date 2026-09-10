/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { mergeOtelDatasetFeatures } from './otel_dataset_feature_mapping';

describe('mergeOtelDatasetFeatures', () => {
  it('maps kubeletstatsreceiver.otel to the kubernetes.pod feature', () => {
    const merged = mergeOtelDatasetFeatures([], [{ key: 'kubeletstatsreceiver.otel' }]);
    expect(merged).toEqual([{ key: 'kubernetes.pod' }]);
  });

  it('ignores unmapped otel datasets', () => {
    const merged = mergeOtelDatasetFeatures([], [{ key: 'hostmetricsreceiver.otel' }]);
    expect(merged).toEqual([]);
  });

  it('does not duplicate a feature that already exists from event.dataset', () => {
    const merged = mergeOtelDatasetFeatures(
      [{ key: 'kubernetes.pod' }],
      [{ key: 'kubeletstatsreceiver.otel' }]
    );
    expect(merged).toEqual([{ key: 'kubernetes.pod' }]);
  });

  it('keeps existing ecs buckets untouched', () => {
    const merged = mergeOtelDatasetFeatures(
      [{ key: 'kubernetes.container' }],
      [{ key: 'kubeletstatsreceiver.otel' }]
    );
    expect(merged).toEqual([{ key: 'kubernetes.container' }, { key: 'kubernetes.pod' }]);
  });
});
