/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { createObservabilityEsClient } from '@kbn/observability-utils-server/es/client/create_observability_es_client';
import type { KibanaRequest } from '@kbn/core/server';
import type { InfraPluginRequestHandlerContext } from '../../types';
import type { InfraBackendLibs } from '../infra_types';

export async function getObserabilityEsClient({
  libs,
  context,
  request,
}: {
  libs: InfraBackendLibs;
  context: InfraPluginRequestHandlerContext;
  request?: KibanaRequest;
}) {
  const [coreContext, infraContext] = await Promise.all([context.core, context.infra]);

  const metricsIndices = await infraContext.getMetricsIndices();

  return {
    metricsIndices,
    ...createObservabilityEsClient({
      client: coreContext.elasticsearch.client.asCurrentUser,
      logger: libs.logger,
      plugin: `infra`,
    }),
  };
}
