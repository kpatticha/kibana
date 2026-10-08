/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/** The app owns its own routing and data fetching, so neither contract carries anything today. */
export type InfrastructureEntitiesPublicSetup = Record<string, never>;

export type InfrastructureEntitiesPublicStart = Record<string, never>;
