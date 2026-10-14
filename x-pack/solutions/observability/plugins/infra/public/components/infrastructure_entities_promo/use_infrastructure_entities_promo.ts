/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useState } from 'react';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import useObservable from 'react-use/lib/useObservable';
import { useLocation } from 'react-router-dom';
import { i18n } from '@kbn/i18n';
import { enableInfrastructureEntities } from '@kbn/observability-plugin/common';
import {
  INFRASTRUCTURE_ENTITIES_APP_ID,
  INFRASTRUCTURE_ENTITIES_SWITCHED_PARAM,
} from '@kbn/deeplinks-observability/constants';
import { useKibanaContextForPlugin } from '../../hooks/use_kibana';
import {
  isMetricsExplorerPath,
  isMetricsHostsPath,
  isMetricsInventoryPath,
} from '../../pages/metrics/header/metrics_header_paths';
import { INFRASTRUCTURE_ENTITIES_PROMO_DISMISSED_STORAGE_KEY } from './constants';

/**
 * Decides whether the "switch to the new infrastructure experience" modal should be offered on the
 * legacy Infrastructure pages, and performs the switch.
 */
export const useInfrastructureEntitiesPromo = () => {
  const { application, chrome, settings, notifications } = useKibanaContextForPlugin().services;
  const { pathname } = useLocation();

  const [isDismissedForever, setDismissedForever] = useLocalStorage<boolean>(
    INFRASTRUCTURE_ENTITIES_PROMO_DISMISSED_STORAGE_KEY,
    false
  );
  const [isClosed, setClosed] = useState(false);
  const [isSwitching, setSwitching] = useState(false);

  const isEnabled = useObservable(
    settings.client.get$<boolean>(enableInfrastructureEntities, false),
    settings.client.get<boolean>(enableInfrastructureEntities, false)
  );

  // Classic keeps both the Infrastructure plugin links and Entities while the setting is off, so
  // there is nothing to promote there.
  const activeSolutionNavId = useObservable(
    chrome.getActiveSolutionNavId$(),
    chrome.getActiveSolutionNavId()
  );
  const isSolutionNav = activeSolutionNavId !== null;

  const isPromotedPage =
    isMetricsInventoryPath(pathname) ||
    isMetricsHostsPath(pathname) ||
    isMetricsExplorerPath(pathname);

  // The Entities app registers a nav link, so its capability entry is the dependency-free way to
  // tell whether the plugin is installed in this deployment.
  const isEntitiesAppAvailable = Boolean(
    application.capabilities.navLinks?.[INFRASTRUCTURE_ENTITIES_APP_ID]
  );
  // Switching writes a space-scoped setting, so only offer it to users who may save it.
  const canSaveAdvancedSettings = Boolean(application.capabilities.advancedSettings?.save);

  const isVisible =
    isSolutionNav &&
    isPromotedPage &&
    isEntitiesAppAvailable &&
    canSaveAdvancedSettings &&
    !isEnabled &&
    !isDismissedForever &&
    !isClosed;

  const close = useCallback(() => {
    setClosed(true);
  }, []);

  const dismissForever = useCallback(() => {
    setDismissedForever(true);
  }, [setDismissedForever]);

  const switchToEntities = useCallback(async () => {
    setSwitching(true);
    try {
      await settings.client.set(enableInfrastructureEntities, true);
      await application.navigateToApp(INFRASTRUCTURE_ENTITIES_APP_ID, {
        path: `?${INFRASTRUCTURE_ENTITIES_SWITCHED_PARAM}=true`,
      });
    } catch (error) {
      setSwitching(false);
      notifications.toasts.addError(error, {
        title: i18n.translate('xpack.infra.infrastructureEntitiesPromo.switchErrorTitle', {
          defaultMessage: 'Unable to switch to the new infrastructure experience',
        }),
      });
    }
  }, [application, notifications, settings]);

  return { isVisible, isSwitching, close, dismissForever, switchToEntities };
};
