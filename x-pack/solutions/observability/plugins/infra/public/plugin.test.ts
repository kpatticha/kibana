/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getInfraDeepLinks, getInfrastructureNavigationEntries } from './plugin';

describe('getInfraDeepLinks', () => {
  it('primary nav links use the shared globalSearch + projectSideNav value', () => {
    const links = getInfraDeepLinks({ metricsExplorerEnabled: true });

    expect(links.find((l) => l.id === 'inventory')?.visibleIn).toEqual([
      'globalSearch',
      'projectSideNav',
    ]);
    expect(links.find((l) => l.id === 'metrics-explorer')?.visibleIn).toEqual([
      'globalSearch',
      'projectSideNav',
    ]);
  });

  it('settings is globalSearch-only (matches main: searchable, not in any nav)', () => {
    const links = getInfraDeepLinks({ metricsExplorerEnabled: false });
    expect(links.find((l) => l.id === 'settings')?.visibleIn).toEqual(['globalSearch']);
  });
});

describe('getInfrastructureNavigationEntries', () => {
  const getApps = (entries: ReturnType<typeof getInfrastructureNavigationEntries>) =>
    entries.map(({ app, path }) => `${app}${path}`);

  it('shows the Infrastructure plugin links and Entities together while the setting is off', () => {
    const entries = getInfrastructureNavigationEntries({
      metricsExplorerEnabled: true,
      infrastructureEntitiesEnabled: false,
      isEntitiesAppAvailable: true,
    });

    expect(getApps(entries)).toEqual([
      'metrics/inventory',
      'metrics/explorer',
      'metrics/hosts',
      'infrastructureEntities/',
    ]);
  });

  it('drops the Infrastructure plugin links once the setting is on', () => {
    const entries = getInfrastructureNavigationEntries({
      metricsExplorerEnabled: true,
      infrastructureEntitiesEnabled: true,
      isEntitiesAppAvailable: true,
    });

    expect(getApps(entries)).toEqual(['infrastructureEntities/']);
  });

  it('omits Entities when the plugin is not installed', () => {
    const entries = getInfrastructureNavigationEntries({
      metricsExplorerEnabled: false,
      infrastructureEntitiesEnabled: false,
      isEntitiesAppAvailable: false,
    });

    expect(getApps(entries)).toEqual(['metrics/inventory', 'metrics/hosts']);
  });

  it('marks the Entities entry as technical preview', () => {
    const entries = getInfrastructureNavigationEntries({
      metricsExplorerEnabled: false,
      infrastructureEntitiesEnabled: true,
      isEntitiesAppAvailable: true,
    });

    expect(entries[0].isTechnicalPreview).toBe(true);
  });
});
