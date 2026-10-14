/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { firstValueFrom, of } from 'rxjs';
import { AIChatExperience } from '@kbn/ai-assistant-common';
import type { NavigationTreeDefinition, NodeDefinition } from '@kbn/core-chrome-browser';
import { coreMock } from '@kbn/core/public/mocks';
import { STACK_MANAGEMENT_NAV_ID } from '@kbn/deeplinks-management';
import { OBSERVABILITY_ENABLE_INFRASTRUCTURE_ENTITIES_ID } from '@kbn/management-settings-ids';
import { createDefinition } from './navigation_tree';
import type { ObservabilityPublicPluginsStart } from './plugin';

const getStackManagementSectionLinks = async (
  sectionId: string,
  alertingV2Enabled = false
): Promise<Array<string | undefined>> => {
  const coreStart = coreMock.createStart();
  coreStart.featureFlags.getBooleanValue$ = jest.fn().mockReturnValue(of(false));
  coreStart.settings.client.get$ = jest.fn().mockReturnValue(of(AIChatExperience.Classic));
  coreStart.settings.globalClient.get.mockReturnValue(alertingV2Enabled);

  const definition = createDefinition(coreStart, {
    streams: { navigationStatus$: of({ status: 'disabled' as const }) },
    ingestHub: { navigationAvailable$: of(false) },
    cloud: { isCloudEnabled: false },
  } as unknown as ObservabilityPublicPluginsStart);

  const { footer } = (await firstValueFrom(definition.navigationTree$)) as NavigationTreeDefinition;
  const stackManagement = footer?.find((item) => item.id === STACK_MANAGEMENT_NAV_ID);
  const section = stackManagement?.children?.find((item) => item.id === sectionId) as
    | NodeDefinition
    | undefined;

  return section?.children?.map((item) => item.link) ?? [];
};

const getInfrastructureSection = async ({
  isPluginAvailable,
  isSettingEnabled,
}: {
  isPluginAvailable: boolean;
  isSettingEnabled: boolean;
}): Promise<NodeDefinition | undefined> => {
  const coreStart = coreMock.createStart();
  coreStart.featureFlags.getBooleanValue$ = jest.fn().mockReturnValue(of(false));
  coreStart.settings.client.get$ = jest
    .fn()
    .mockImplementation((key: string) =>
      of(
        key === OBSERVABILITY_ENABLE_INFRASTRUCTURE_ENTITIES_ID
          ? isSettingEnabled
          : AIChatExperience.Classic
      )
    );

  const definition = createDefinition(coreStart, {
    streams: { navigationStatus$: of({ status: 'disabled' as const }) },
    ingestHub: { navigationAvailable$: of(false) },
    cloud: { isCloudEnabled: false },
    ...(isPluginAvailable ? { infrastructureEntities: {} } : {}),
  } as unknown as ObservabilityPublicPluginsStart);

  const { body } = (await firstValueFrom(definition.navigationTree$)) as NavigationTreeDefinition;

  return body?.find((item) => 'id' in item && item.id === 'metrics') as NodeDefinition | undefined;
};

const getVisibleLinks = (section: NodeDefinition | undefined): Array<string | undefined> =>
  section?.children?.[0]?.children
    ?.filter((item) => item.sideNavStatus !== 'hidden')
    .map((item) => item.link) ?? [];

describe('Observability solution navigation tree', () => {
  it('keeps Stack Rules and hides Stack Alerts while alerting v2 is disabled', async () => {
    const alertsLinks = await getStackManagementSectionLinks('alerts_and_insights', false);

    expect(alertsLinks).not.toContain('management:triggersActionsAlerts');
    expect(alertsLinks).toEqual(
      expect.arrayContaining([
        'management:triggersActions',
        'management:triggersActionsConnectors',
        'management:maintenanceWindows',
      ])
    );
  });

  it('hides Stack Alerts and Stack Rules when alerting v2 is enabled', async () => {
    const alertsLinks = await getStackManagementSectionLinks('alerts_and_insights', true);

    expect(alertsLinks).not.toContain('management:triggersActionsAlerts');
    expect(alertsLinks).not.toContain('management:triggersActions');
    expect(alertsLinks).toEqual(
      expect.arrayContaining([
        'management:triggersActionsConnectors',
        'management:maintenanceWindows',
      ])
    );
  });

  it('includes service accounts in Stack Management > Security', async () => {
    const securityLinks = await getStackManagementSectionLinks('security');

    expect(securityLinks).toContain('management:service_accounts');
  });

  const legacyInfrastructureLinks = [
    'metrics:inventory',
    'metrics:hosts',
    'metrics:metrics-explorer',
  ];

  it('shows the Infrastructure plugin links when the setting is disabled', async () => {
    const infrastructure = await getInfrastructureSection({
      isPluginAvailable: true,
      isSettingEnabled: false,
    });

    expect(infrastructure?.link).toBe('metrics:inventory');
    expect(getVisibleLinks(infrastructure)).toEqual(legacyInfrastructureLinks);
  });

  it('shows the Infrastructure plugin links when the plugin is unavailable, even if the setting is enabled', async () => {
    const infrastructure = await getInfrastructureSection({
      isPluginAvailable: false,
      isSettingEnabled: true,
    });

    expect(infrastructure?.link).toBe('metrics:inventory');
    expect(getVisibleLinks(infrastructure)).toEqual(legacyInfrastructureLinks);
  });

  it('shows only Entities when the plugin is available and the setting is enabled', async () => {
    const infrastructure = await getInfrastructureSection({
      isPluginAvailable: true,
      isSettingEnabled: true,
    });

    expect(infrastructure?.link).toBe('infrastructureEntities');
    expect(getVisibleLinks(infrastructure)).toEqual(['infrastructureEntities']);
  });
});
