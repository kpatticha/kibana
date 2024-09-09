/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Read list privileges API endpoint
 *   version: 2023-10-31
 */

import { z } from '@kbn/zod';

export type ListPrivileges = z.infer<typeof ListPrivileges>;
export const ListPrivileges = z.object({
  username: z.string(),
  has_all_requested: z.boolean(),
  cluster: z.object({}).catchall(z.boolean()),
  index: z.object({}).catchall(z.object({}).catchall(z.boolean())),
  application: z.object({}).catchall(z.boolean()),
});

export type ListItemPrivileges = z.infer<typeof ListItemPrivileges>;
export const ListItemPrivileges = z.object({
  username: z.string(),
  has_all_requested: z.boolean(),
  cluster: z.object({}).catchall(z.boolean()),
  index: z.object({}).catchall(z.object({}).catchall(z.boolean())),
  application: z.object({}).catchall(z.boolean()),
});

export type ReadListPrivilegesResponse = z.infer<typeof ReadListPrivilegesResponse>;
export const ReadListPrivilegesResponse = z.object({
  lists: ListPrivileges,
  listItems: ListItemPrivileges,
  is_authenticated: z.boolean(),
});
