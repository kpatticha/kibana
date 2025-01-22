/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { type ObservabilityElasticsearchClient } from '@kbn/observability-utils-server/es/client/create_observability_es_client';
import { kqlQuery, rangeQuery } from '@kbn/observability-plugin/server';
import type { ApmDataAccessServicesWrapper } from '../../../../lib/helpers/get_apm_data_access_client';
import type { GetInfraAssetCountRequestBodyPayload } from '../../../../../common/http_api';
import type { InfraMetricsClient } from '../../../../lib/helpers/get_infra_metrics_client';
import { HOST_NAME_FIELD } from '../../../../../common/constants';
import { assertQueryStructure } from '../utils';
import { getDocumentsFilter } from '../helpers/query';
import { getEsqlDateRangeFilter } from '';

export async function getHostsCountWithEsql({
  obsEsClient,
  apmDataAccessServices,
  query,
  from,
  to,
}: GetInfraAssetCountRequestBodyPayload & {
  obsEsClient: ObservabilityElasticsearchClient;
  apmDataAccessServices?: ApmDataAccessServicesWrapper;
}) {
  const documentsFilter = await getDocumentsFilter({
    apmDataAccessServices,
    from,
    to,
  });

  const { metricsIndices } = obsEsClient;

  const getFilter = () => ({
    bool: {
      filter: [query, rangeQuery(from, to)],
      should: [...documentsFilter],
    },
  });

  const response = await obsEsClient.esql(
    'get_hosts_count_with_esql',
    {
      query: `FROM ${metricsIndices} | WHERE ${getEsqlDateRangeFilter(
        from,
        to
      )} | STATS _count = COUNT_DISTINCT(${HOST_NAME_FIELD}) | KEEP _count`,
      filter: getFilter(),
    },
    {
      transform: 'plain',
    }
  );

  return response.hits[0]._count;
}
