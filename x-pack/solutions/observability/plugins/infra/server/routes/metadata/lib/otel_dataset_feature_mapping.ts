/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { InfraMetadataAggregationBucket } from '../../../lib/adapters/framework';

// Maps OTel data_stream.dataset values to their beats-equivalent
// event.dataset feature names consumed by the metric detail layouts.
const OTEL_DATASET_TO_FEATURE: Record<string, string> = {
  'kubeletstatsreceiver.otel': 'kubernetes.pod',
};

export const mergeOtelDatasetFeatures = (
  buckets: InfraMetadataAggregationBucket[],
  otelBuckets: InfraMetadataAggregationBucket[]
): InfraMetadataAggregationBucket[] => {
  const mapped = otelBuckets
    .filter((bucket) => OTEL_DATASET_TO_FEATURE[bucket.key] !== undefined)
    .map((bucket) => ({ ...bucket, key: OTEL_DATASET_TO_FEATURE[bucket.key] }))
    .filter((bucket) => !buckets.some((existing) => existing.key === bucket.key));

  return [...buckets, ...mapped];
};
