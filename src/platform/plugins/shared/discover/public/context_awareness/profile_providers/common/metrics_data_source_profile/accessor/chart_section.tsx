/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useMemo } from 'react';
import { useObservable } from '@kbn/use-observable';
import type { ChartSectionProps } from '@kbn/unified-histogram/types';
import { UnifiedMetricsExperienceGrid } from '@kbn/unified-chart-section-viewer';
import {
  internalStateActions,
  useAppStateSelector,
  useCurrentTabAction,
  useInternalStateDispatch,
} from '../../../../../application/main/state_management/redux';
import { useDiscoverServices } from '../../../../../hooks/use_discover_services';
import type { DiscoverAppState } from '../../../../../application/main/state_management/redux';
import type { DataSourceProfileProvider } from '../../../../profiles';
import type { ContextAwarenessToolkit } from '../../../../toolkit';
import type { ContextAwarenessToolkitActions } from '../../../../toolkit';
import { METRICS_STATE_DEF } from '../../../../profile_state';
import { METRICS_DATA_SOURCE_PROFILE_ID } from '../profile';

/**
 * Wrapper component that reads breakdownField from Discover's app state
 * and passes it to UnifiedMetricsExperienceGrid for syncing with dimensions selector.
 * It also drives the grid's searchTerm and isFullscreen from the profile-state adapter
 * (PR #271164 pattern) so those values are properly persisted per their declared lifetime
 * (searchText → URL, fullScreen → Ui/in-memory only).
 */
const MetricsExperienceGridWrapper = (
  props: ChartSectionProps & {
    actions: ContextAwarenessToolkitActions;
    toolkit: ContextAwarenessToolkit;
  }
) => {
  const breakdownField = useAppStateSelector((state: DiscoverAppState) => state.breakdownField);
  const dispatch = useInternalStateDispatch();
  const updateAppState = useCurrentTabAction(internalStateActions.updateAppState);
  const { discoverShared, dataViews, notifications, docLinks, logger } = useDiscoverServices();

  // Profile-state adapter: drives the grid's searchTerm (URL-persisted) and
  // isFullscreen (Ui/in-memory only) through the profile-state mechanism.
  // Memoize adapter and observable so useObservable doesn't re-subscribe on every render.
  const stateAdapter = useMemo(
    () => props.toolkit.getStateAdapter(METRICS_STATE_DEF),
    [props.toolkit]
  );
  const metricsState$ = useMemo(() => stateAdapter.getState$(), [stateAdapter]);
  const metricsState = useObservable(metricsState$, stateAdapter.getState());

  const onSearchTermChange = useCallback(
    (value: string) => {
      stateAdapter.updateState({ searchText: value });
    },
    [stateAdapter]
  );

  const onToggleFullscreen = useCallback(() => {
    stateAdapter.updateState({ fullScreen: !stateAdapter.getState().fullScreen });
  }, [stateAdapter]);

  const onBreakdownFieldChange = useCallback(
    (nextBreakdownField?: string) => {
      dispatch(updateAppState({ appState: { breakdownField: nextBreakdownField } }));
    },
    [dispatch, updateAppState]
  );

  const externalServices = useMemo(
    () => ({
      discoverShared,
      dataViews,
      notifications,
      docLinks,
      logger: logger.get(METRICS_DATA_SOURCE_PROFILE_ID),
    }),
    [discoverShared, dataViews, notifications, docLinks, logger]
  );

  return (
    <UnifiedMetricsExperienceGrid
      {...props}
      actions={props.actions}
      profileId={METRICS_DATA_SOURCE_PROFILE_ID}
      breakdownField={breakdownField}
      onBreakdownFieldChange={onBreakdownFieldChange}
      externalServices={externalServices}
      searchTerm={metricsState.searchText}
      onSearchTermChange={onSearchTermChange}
      isFullscreen={metricsState.fullScreen}
      onToggleFullscreen={onToggleFullscreen}
    />
  );
};

export const createChartSection =
  (): DataSourceProfileProvider['profile']['getChartSectionConfiguration'] =>
  (prev, { toolkit }) =>
  () => {
    return {
      ...prev(),
      renderChartSection: (props) => {
        return (
          <MetricsExperienceGridWrapper {...props} actions={toolkit.actions} toolkit={toolkit} />
        );
      },
      replaceDefaultChart: true,
      localStorageKeyPrefix: 'discover:metricsExperience',
      defaultTopPanelHeight: 'max-content',
    };
  };
