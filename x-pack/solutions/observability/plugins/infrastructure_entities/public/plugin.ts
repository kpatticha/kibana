/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AppMountParameters, CoreSetup, Plugin } from '@kbn/core/public';
import { DEFAULT_APP_CATEGORIES } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';
import { INFRASTRUCTURE_ENTITIES_APP_ID, INFRASTRUCTURE_ENTITIES_BASE_PATH } from '../common';
import type { InfrastructureEntitiesPublicSetup, InfrastructureEntitiesPublicStart } from './types';

export class InfrastructureEntitiesPlugin
  implements Plugin<InfrastructureEntitiesPublicSetup, InfrastructureEntitiesPublicStart>
{
  public setup(
    coreSetup: CoreSetup<never, InfrastructureEntitiesPublicStart>
  ): InfrastructureEntitiesPublicSetup {
    const startServices = coreSetup.getStartServices();

    coreSetup.application.register({
      id: INFRASTRUCTURE_ENTITIES_APP_ID,
      title: i18n.translate('xpack.infrastructureEntities.appTitle', {
        defaultMessage: 'Infrastructure entities',
      }),
      euiIconType: 'logoObservability',
      appRoute: INFRASTRUCTURE_ENTITIES_BASE_PATH,
      category: DEFAULT_APP_CATEGORIES.observability,
      mount: async (params: AppMountParameters) => {
        const [coreStart] = await startServices;
        const { mountInfrastructureEntitiesApp } = await import('./application/mount');
        return mountInfrastructureEntitiesApp({ coreStart, params });
      },
    });

    return {};
  }

  public start(): InfrastructureEntitiesPublicStart {
    return {};
  }

  public stop() {}
}
