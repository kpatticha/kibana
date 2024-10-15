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
 *   title: Entity Store Common Schema
 *   version: 1
 */

import { z } from '@kbn/zod';

export type EntityType = z.infer<typeof EntityType>;
export const EntityType = z.enum(['user', 'host']);
export type EntityTypeEnum = typeof EntityType.enum;
export const EntityTypeEnum = EntityType.enum;

export type IndexPattern = z.infer<typeof IndexPattern>;
export const IndexPattern = z.string();

export type EngineStatus = z.infer<typeof EngineStatus>;
export const EngineStatus = z.enum(['installing', 'started', 'stopped', 'updating']);
export type EngineStatusEnum = typeof EngineStatus.enum;
export const EngineStatusEnum = EngineStatus.enum;

export type EngineDescriptor = z.infer<typeof EngineDescriptor>;
export const EngineDescriptor = z.object({
  type: EntityType,
  indexPattern: IndexPattern,
  status: EngineStatus,
  filter: z.string().optional(),
  fieldHistoryLength: z.number().int(),
});

export type InspectQuery = z.infer<typeof InspectQuery>;
export const InspectQuery = z.object({
  response: z.array(z.string()),
  dsl: z.array(z.string()),
});
