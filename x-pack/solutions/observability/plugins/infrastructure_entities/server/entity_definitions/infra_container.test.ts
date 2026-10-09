/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { infraContainerEntityDefinition } from './infra_container';

// Mirrors the Entity Store registry's own validation rules, so a rejection surfaces here rather
// than as a runtime log line during plugin setup.
const ENTITY_DEFINITION_TYPE_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const BUILT_IN_TYPES = ['host', 'user', 'service', 'generic'];

describe('infraContainerEntityDefinition', () => {
  it('uses a type name the registry accepts', () => {
    expect(infraContainerEntityDefinition.type).toMatch(ENTITY_DEFINITION_TYPE_PATTERN);
    expect(infraContainerEntityDefinition.type.length).toBeLessThanOrEqual(64);
  });

  it('does not collide with a built-in type', () => {
    expect(BUILT_IN_TYPES).not.toContain(infraContainerEntityDefinition.type);
  });

  it('is managed by this plugin', () => {
    expect(infraContainerEntityDefinition.managedBy).toEqual({
      kind: 'plugin',
      id: 'infrastructureEntities',
    });
  });

  it('identifies containers by container.id', () => {
    expect(infraContainerEntityDefinition.identityField).toEqual({ singleField: 'container.id' });
  });

  it('declares a destination for entity.name', () => {
    const name = infraContainerEntityDefinition.fields.find(
      ({ destination }) => destination === 'entity.name'
    );

    expect(name).toEqual(
      expect.objectContaining({
        source: 'container.name',
        retention: { operation: 'prefer_newest_value' },
      })
    );
  });

  it('declares each destination once', () => {
    const destinations = infraContainerEntityDefinition.fields.map(
      ({ destination }) => destination
    );

    expect(destinations).toHaveLength(new Set(destinations).size);
  });
});
