/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback } from 'react';
import { createContext } from 'react';
import type { Dimension } from '../../../../../types';
import {
  type FlyoutState,
  type FlyoutTabId,
  type MetricsExperienceRestorableState,
  useRestorableState,
} from '../../../../../restorable_state';

export interface MetricsExperienceStateContextValue extends MetricsExperienceRestorableState {
  profileId: string;
  onPageChange: (value: number) => void;
  onDimensionsChange: (value: Dimension[]) => void;
  onSearchTermChange: (value: string) => void;
  onToggleFullscreen: () => void;
  onFlyoutStateChange: (value: FlyoutState | undefined) => void;
  onFlyoutSelectedTabChange: (value: FlyoutTabId) => void;
}

export const MetricsExperienceStateContext =
  createContext<MetricsExperienceStateContextValue | null>(null);

export function MetricsExperienceStateProvider({
  children,
  profileId,
  searchTerm: controlledSearchTerm,
  onSearchTermChange: onControlledSearchTermChange,
  isFullscreen: controlledIsFullscreen,
  onToggleFullscreen: onControlledToggleFullscreen,
}: {
  children: React.ReactNode;
  profileId: string;
  /** When provided, overrides the internal restorable-state value (controlled mode). */
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  /** When provided, overrides the internal restorable-state value (controlled mode). */
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  const [currentPage, setCurrentPage] = useRestorableState('currentPage', 0);
  const [selectedDimensions, setSelectedDimensions] = useRestorableState('selectedDimensions', []);
  const [internalSearchTerm, setInternalSearchTerm] = useRestorableState('searchTerm', '');
  const [internalIsFullscreen, setInternalIsFullscreen] = useRestorableState('isFullscreen', false);
  const [flyoutState, setFlyoutState] = useRestorableState('flyoutState', undefined);

  // Prefer controlled values when provided; fall back to internal restorable state.
  const searchTerm = controlledSearchTerm !== undefined ? controlledSearchTerm : internalSearchTerm;
  const isFullscreen =
    controlledIsFullscreen !== undefined ? controlledIsFullscreen : internalIsFullscreen;

  const onDimensionsChange = useCallback(
    (nextDimensions: Dimension[]) => {
      setSelectedDimensions(nextDimensions);
    },
    [setSelectedDimensions]
  );

  const onPageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const onSearchTermChange = useCallback(
    (term: string) => {
      if (onControlledSearchTermChange) {
        // Controlled mode: delegate to the host; still reset the page locally.
        if (term !== searchTerm) {
          setCurrentPage(0);
        }
        onControlledSearchTermChange(term);
      } else {
        setInternalSearchTerm((prevTerm) => {
          if (prevTerm !== term) {
            setCurrentPage(0);
          }
          return term;
        });
      }
    },
    [onControlledSearchTermChange, searchTerm, setInternalSearchTerm, setCurrentPage]
  );

  const onToggleFullscreen = useCallback(() => {
    if (onControlledToggleFullscreen) {
      onControlledToggleFullscreen();
    } else {
      setInternalIsFullscreen((prev) => !prev);
    }
  }, [onControlledToggleFullscreen, setInternalIsFullscreen]);

  const onFlyoutStateChange = useCallback(
    (nextFlyoutState: FlyoutState | undefined) => {
      setFlyoutState(nextFlyoutState);
    },
    [setFlyoutState]
  );

  const onFlyoutSelectedTabChange = useCallback(
    (nextTabId: FlyoutTabId) => {
      setFlyoutState((prev) => (prev ? { ...prev, selectedTabId: nextTabId } : prev));
    },
    [setFlyoutState]
  );

  return (
    <MetricsExperienceStateContext.Provider
      value={{
        profileId,
        currentPage,
        isFullscreen,
        searchTerm,
        selectedDimensions,
        flyoutState,
        onPageChange,
        onDimensionsChange,
        onSearchTermChange,
        onToggleFullscreen,
        onFlyoutStateChange,
        onFlyoutSelectedTabChange,
      }}
    >
      {children}
    </MetricsExperienceStateContext.Provider>
  );
}
