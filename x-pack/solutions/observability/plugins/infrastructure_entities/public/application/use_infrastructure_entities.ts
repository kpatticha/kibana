/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEffect, useState } from 'react';
import type { HttpStart } from '@kbn/core/public';
import type { Entity } from '@kbn/entity-store/common';
import { searchEntitiesFromEntityStore } from '@kbn/entity-store/public';
import { INFRASTRUCTURE_ENTITY_TYPES } from '../../common';

export interface InfrastructureEntitiesResult {
  entities: Entity[];
  total: number;
  isLoading: boolean;
  error?: Error;
}

export interface InfrastructureEntitiesParams {
  pageIndex: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Lists infrastructure entities from the Entity Store. Re-fetches whenever pagination or sorting changes. */
export const useInfrastructureEntities = (
  http: HttpStart,
  { pageIndex, pageSize, sortField, sortOrder }: InfrastructureEntitiesParams
): InfrastructureEntitiesResult => {
  const [result, setResult] = useState<InfrastructureEntitiesResult>({
    entities: [],
    total: 0,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setResult((previous) => ({ ...previous, isLoading: true, error: undefined }));

    searchEntitiesFromEntityStore(
      http,
      {
        // The route is 1-based; EuiBasicTable pagination is 0-based.
        entityTypes: [...INFRASTRUCTURE_ENTITY_TYPES],
        page: pageIndex + 1,
        perPage: pageSize,
        sortField,
        sortOrder,
      },
      { signal: controller.signal }
    )
      .then((response) => {
        if (!active) return;
        setResult({ entities: response.records, total: response.total, isLoading: false });
      })
      .catch((error: Error) => {
        if (!active || controller.signal.aborted) return;
        setResult({ entities: [], total: 0, isLoading: false, error });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [http, pageIndex, pageSize, sortField, sortOrder]);

  return result;
};
