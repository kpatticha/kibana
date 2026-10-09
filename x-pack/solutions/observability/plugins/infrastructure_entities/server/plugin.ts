/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreSetup, Logger, Plugin, PluginInitializerContext } from '@kbn/core/server';
import { infraContainerEntityDefinition } from './entity_definitions/infra_container';
import type {
  InfrastructureEntitiesServerSetup,
  InfrastructureEntitiesServerStart,
  InfrastructureEntitiesSetupDependencies,
} from './types';

export class InfrastructureEntitiesPlugin
  implements
    Plugin<
      InfrastructureEntitiesServerSetup,
      InfrastructureEntitiesServerStart,
      InfrastructureEntitiesSetupDependencies
    >
{
  private readonly logger: Logger;

  constructor(context: PluginInitializerContext) {
    this.logger = context.logger.get();
  }

  // Entity definitions are accepted during setup only; the Entity Store rejects later registrations.
  public setup(
    _core: CoreSetup,
    { entityStore }: InfrastructureEntitiesSetupDependencies
  ): InfrastructureEntitiesServerSetup {
    const result = entityStore.registerEntityDefinition(infraContainerEntityDefinition);

    if (!result.ok) {
      this.logger.error(
        `Entity Store rejected the '${infraContainerEntityDefinition.type}' definition: ${result.reason}`
      );
    }

    return {};
  }

  public start(): InfrastructureEntitiesServerStart {
    return {};
  }

  public stop() {}
}
