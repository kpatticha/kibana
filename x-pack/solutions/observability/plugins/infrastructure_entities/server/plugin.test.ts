/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { coreMock, loggingSystemMock } from '@kbn/core/server/mocks';
import type { EntityStoreSetupContract } from '@kbn/entity-store/server';
import { InfrastructureEntitiesPlugin } from './plugin';
import { infraContainerEntityDefinition } from './entity_definitions/infra_container';

describe('InfrastructureEntitiesPlugin', () => {
  const createEntityStore = (
    result: ReturnType<EntityStoreSetupContract['registerEntityDefinition']>
  ) =>
    ({
      registerEntityDefinition: jest.fn().mockReturnValue(result),
      registerEntityMaintainer: jest.fn(),
    } as unknown as EntityStoreSetupContract);

  it('registers the container entity definition at setup', () => {
    const initializerContext = coreMock.createPluginInitializerContext();
    const entityStore = createEntityStore({ ok: true });

    new InfrastructureEntitiesPlugin(initializerContext).setup(coreMock.createSetup(), {
      entityStore,
    });

    expect(entityStore.registerEntityDefinition).toHaveBeenCalledWith(
      infraContainerEntityDefinition
    );
    expect(loggingSystemMock.collect(initializerContext.logger).error).toEqual([]);
  });

  it('logs the reason when the Entity Store rejects the definition', () => {
    const initializerContext = coreMock.createPluginInitializerContext();
    const entityStore = createEntityStore({ ok: false, reason: 'type name is already registered' });

    new InfrastructureEntitiesPlugin(initializerContext).setup(coreMock.createSetup(), {
      entityStore,
    });

    expect(loggingSystemMock.collect(initializerContext.logger).error).toEqual([
      [`Entity Store rejected the 'infra.container' definition: type name is already registered`],
    ]);
  });
});
