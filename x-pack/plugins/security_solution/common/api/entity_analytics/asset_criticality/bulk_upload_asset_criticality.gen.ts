/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Asset Criticality Bulk Upsert Schema
 *   version: 1
 */

import { z } from 'zod';

import { CreateAssetCriticalityRecord } from './common.gen';

export type AssetCriticalityBulkUploadErrorItem = z.infer<
  typeof AssetCriticalityBulkUploadErrorItem
>;
export const AssetCriticalityBulkUploadErrorItem = z.object({
  message: z.string(),
  index: z.number().int(),
});

export type AssetCriticalityBulkUploadStats = z.infer<typeof AssetCriticalityBulkUploadStats>;
export const AssetCriticalityBulkUploadStats = z.object({
  successful: z.number().int(),
  failed: z.number().int(),
  total: z.number().int(),
});

export type BulkUpsertAssetCriticalityRecordsRequestBody = z.infer<
  typeof BulkUpsertAssetCriticalityRecordsRequestBody
>;
export const BulkUpsertAssetCriticalityRecordsRequestBody = z.object({
  records: z.array(CreateAssetCriticalityRecord).min(1).max(1000),
});
export type BulkUpsertAssetCriticalityRecordsRequestBodyInput = z.input<
  typeof BulkUpsertAssetCriticalityRecordsRequestBody
>;

export type BulkUpsertAssetCriticalityRecordsResponse = z.infer<
  typeof BulkUpsertAssetCriticalityRecordsResponse
>;
export const BulkUpsertAssetCriticalityRecordsResponse = z.object({
  errors: z.array(AssetCriticalityBulkUploadErrorItem),
  stats: AssetCriticalityBulkUploadStats,
});
