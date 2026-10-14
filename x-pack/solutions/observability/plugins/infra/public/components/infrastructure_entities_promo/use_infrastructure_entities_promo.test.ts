/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act, renderHook } from '@testing-library/react';
import { of } from 'rxjs';
import { coreMock } from '@kbn/core/public/mocks';
import { enableInfrastructureEntities } from '@kbn/observability-plugin/common';
import { INFRASTRUCTURE_ENTITIES_APP_ID } from '@kbn/deeplinks-observability/constants';
import { useInfrastructureEntitiesPromo } from './use_infrastructure_entities_promo';
import { useKibanaContextForPlugin } from '../../hooks/use_kibana';

jest.mock('../../hooks/use_kibana');

const mockPathname = jest.fn<string, []>();
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname() }),
}));

const useKibanaContextForPluginMock = useKibanaContextForPlugin as jest.MockedFunction<
  typeof useKibanaContextForPlugin
>;

const navigateToApp = jest.fn();
const setSetting = jest.fn().mockResolvedValue(undefined);

const setup = ({
  isSettingEnabled = false,
  isEntitiesAppAvailable = true,
  canSaveAdvancedSettings = true,
  activeSolutionNavId = 'oblt',
}: {
  isSettingEnabled?: boolean;
  isEntitiesAppAvailable?: boolean;
  canSaveAdvancedSettings?: boolean;
  activeSolutionNavId?: string | null;
} = {}) => {
  const core = coreMock.createStart();

  useKibanaContextForPluginMock.mockReturnValue({
    services: {
      ...core,
      application: {
        ...core.application,
        navigateToApp,
        capabilities: {
          ...core.application.capabilities,
          navLinks: isEntitiesAppAvailable ? { [INFRASTRUCTURE_ENTITIES_APP_ID]: true } : {},
          advancedSettings: { save: canSaveAdvancedSettings },
        },
      },
      chrome: {
        ...core.chrome,
        getActiveSolutionNavId: jest.fn().mockReturnValue(activeSolutionNavId),
        getActiveSolutionNavId$: jest.fn().mockReturnValue(of(activeSolutionNavId)),
      },
      settings: {
        ...core.settings,
        client: {
          ...core.settings.client,
          get: jest.fn().mockReturnValue(isSettingEnabled),
          get$: jest.fn().mockReturnValue(of(isSettingEnabled)),
          set: setSetting,
        },
      },
    },
  } as unknown as ReturnType<typeof useKibanaContextForPlugin>);

  return renderHook(() => useInfrastructureEntitiesPromo());
};

describe('useInfrastructureEntitiesPromo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockPathname.mockReturnValue('/inventory');
  });

  it.each(['/inventory', '/hosts', '/explorer'])('is visible on %s', (pathname) => {
    mockPathname.mockReturnValue(pathname);

    expect(setup().result.current.isVisible).toBe(true);
  });

  it.each(['/settings', '/detail/host/node-1'])('is not visible on %s', (pathname) => {
    mockPathname.mockReturnValue(pathname);

    expect(setup().result.current.isVisible).toBe(false);
  });

  it('is not visible in the classic view, where both sets of links are shown', () => {
    expect(setup({ activeSolutionNavId: null }).result.current.isVisible).toBe(false);
  });

  it('is not visible once the setting is already enabled', () => {
    expect(setup({ isSettingEnabled: true }).result.current.isVisible).toBe(false);
  });

  it('is not visible when the Entities app is not installed', () => {
    expect(setup({ isEntitiesAppAvailable: false }).result.current.isVisible).toBe(false);
  });

  it('is not visible to users who cannot save advanced settings', () => {
    expect(setup({ canSaveAdvancedSettings: false }).result.current.isVisible).toBe(false);
  });

  it('hides for the session when closed, without persisting', () => {
    const { result } = setup();

    act(() => result.current.close());

    expect(result.current.isVisible).toBe(false);
    expect(window.localStorage.length).toBe(0);
  });

  it('stays hidden across mounts once dismissed for good', () => {
    const { result } = setup();

    act(() => result.current.dismissForever());

    expect(result.current.isVisible).toBe(false);
    expect(setup().result.current.isVisible).toBe(false);
  });

  it('enables the setting and navigates to the Entities app on switch', async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.switchToEntities();
    });

    expect(setSetting).toHaveBeenCalledWith(enableInfrastructureEntities, true);
    expect(navigateToApp).toHaveBeenCalledWith(INFRASTRUCTURE_ENTITIES_APP_ID, {
      path: '?switched=true',
    });
  });
});
