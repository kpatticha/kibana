/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RegistrableEntityDefinition } from '@kbn/entity-store/server';
import { INFRA_CONTAINER_ENTITY_TYPE } from '../../common';
import { PLUGIN_ID } from '../plugin_id';

/**
 * Container entities extracted from infrastructure metrics documents. Identity is `container.id`,
 * the only container field guaranteed to be stable across restarts and reschedules.
 */
export const infraContainerEntityDefinition: RegistrableEntityDefinition = {
  type: INFRA_CONTAINER_ENTITY_TYPE,
  name: `Observability '${INFRA_CONTAINER_ENTITY_TYPE}' Entity Store definition`,
  managedBy: { kind: 'plugin', id: PLUGIN_ID },
  entityTypeFallback: 'Container',
  identityField: { singleField: 'container.id' },
  indexPatterns: ['metrics-*'],
  fields: [
    {
      source: 'container.name',
      destination: 'entity.name',
      retention: { operation: 'prefer_newest_value' },
      mapping: { type: 'keyword' },
    },
    {
      source: 'container.id',
      destination: 'container.id',
      retention: { operation: 'collect_values' },
      mapping: { type: 'keyword' },
    },
    {
      source: 'container.image.name',
      destination: 'container.image.name',
      retention: { operation: 'collect_values' },
      mapping: { type: 'keyword' },
    },
    {
      source: 'container.runtime',
      destination: 'container.runtime',
      retention: { operation: 'collect_values' },
      mapping: { type: 'keyword' },
    },
    {
      source: 'host.name',
      destination: 'host.name',
      retention: { operation: 'collect_values' },
      mapping: { type: 'keyword' },
    },
    {
      source: 'cloud.provider',
      destination: 'cloud.provider',
      retention: { operation: 'collect_values' },
      mapping: { type: 'keyword' },
    },
    {
      source: 'cloud.region',
      destination: 'cloud.region',
      retention: { operation: 'collect_values' },
      mapping: { type: 'keyword' },
    },
  ],
};
