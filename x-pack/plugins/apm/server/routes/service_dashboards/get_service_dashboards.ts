/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SavedObjectsClientContract } from '@kbn/core/server';
import {
  APM_SERVICE_DASHBOARD_SAVED_OBJECT_TYPE,
  SavedServiceDashboard,
  ServiceDashboard,
} from '../../../common/service_dashboards';

interface Props {
  savedObjectsClient: SavedObjectsClientContract;
  filter: string;
}

export async function getServiceDashboards({
  savedObjectsClient,
  filter,
}: Props): Promise<SavedServiceDashboard[]> {
  const result = await savedObjectsClient.find<ServiceDashboard>({
    type: APM_SERVICE_DASHBOARD_SAVED_OBJECT_TYPE,
    page: 1,
    perPage: 100,
    filter,
    sortField: 'updated_at',
    sortOrder: 'desc',
  });

  return result.saved_objects.map(
    ({ id, attributes, updated_at: upatedAt }) => ({
      id,
      updatedAt: upatedAt ? Date.parse(upatedAt) : 0,
      ...attributes,
    })
  );
}
