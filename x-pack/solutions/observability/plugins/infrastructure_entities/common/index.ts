/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EntityType } from '@kbn/entity-store/common';

export {
  INFRASTRUCTURE_ENTITIES_APP_ID,
  INFRASTRUCTURE_ENTITIES_APP_ROUTE,
  INFRASTRUCTURE_ENTITIES_BASE_PATH,
} from '@kbn/deeplinks-observability';

/** Entity Store type contributed by this plugin's definition. */
export const INFRA_CONTAINER_ENTITY_TYPE = 'infra.container';

/**
 * Built-in Entity Store types the app lists. `INFRA_CONTAINER_ENTITY_TYPE` is absent because the
 * browser search client still types its `entityTypes` as the closed built-in `EntityType` union.
 */
export const INFRASTRUCTURE_ENTITY_TYPES: readonly EntityType[] = ['host', 'generic'];
