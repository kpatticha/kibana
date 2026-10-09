/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nProvider } from '@kbn/i18n-react';
import { httpServiceMock } from '@kbn/core/public/mocks';
import { searchEntitiesFromEntityStore } from '@kbn/entity-store/public';
import { EntitiesTable } from './entities_table';

jest.mock('@kbn/entity-store/public', () => ({
  searchEntitiesFromEntityStore: jest.fn(),
}));

const search = jest.mocked(searchEntitiesFromEntityStore);

const renderTable = () => {
  const http = httpServiceMock.createStartContract();
  render(
    <I18nProvider>
      <EntitiesTable http={http} />
    </I18nProvider>
  );
  return http;
};

describe('EntitiesTable', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists the entities returned by the Entity Store', async () => {
    search.mockResolvedValue({
      records: [{ entity: { id: 'host:web-1', name: 'web-1', type: 'host' } }],
      page: 1,
      per_page: 10,
      total: 1,
    });

    renderTable();

    expect(await screen.findByText('web-1')).toBeInTheDocument();
  });

  it('requests the first page using the route 1-based page number', async () => {
    search.mockResolvedValue({ records: [], page: 1, per_page: 10, total: 0 });

    const http = renderTable();

    await waitFor(() =>
      expect(search).toHaveBeenCalledWith(
        http,
        expect.objectContaining({ page: 1, perPage: 10, entityTypes: ['host', 'generic'] }),
        expect.anything()
      )
    );
  });

  it('shows an empty prompt when the store has no entities', async () => {
    search.mockResolvedValue({ records: [], page: 1, per_page: 10, total: 0 });

    renderTable();

    expect(await screen.findByText('No infrastructure entities yet')).toBeInTheDocument();
  });

  it('shows the failure reason when the request fails', async () => {
    search.mockRejectedValue(new Error('Entity Store is not installed'));

    renderTable();

    expect(await screen.findByText('Could not load infrastructure entities')).toBeInTheDocument();
    expect(screen.getByText('Entity Store is not installed')).toBeInTheDocument();
  });
});
