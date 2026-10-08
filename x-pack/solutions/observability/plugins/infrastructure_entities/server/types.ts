/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EntityStoreSetupContract } from '@kbn/entity-store/server';

export interface InfrastructureEntitiesSetupDependencies {
  entityStore: EntityStoreSetupContract;
}

/** The plugin contributes an entity definition at setup; it exposes no contract of its own. */
export type InfrastructureEntitiesServerSetup = Record<string, never>;

export type InfrastructureEntitiesServerStart = Record<string, never>;
