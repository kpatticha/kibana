/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { omit } from 'lodash';
import React, { useMemo } from 'react';
import { FETCH_STATUS } from '../../../../../../../observability_shared/public';
import { useApmParams } from '../../../../../hooks/use_apm_params';
import { useApmRouter } from '../../../../../hooks/use_apm_router';
import { useBreakpoints } from '../../../../../hooks/use_breakpoints';
import { isFailure, isPending } from '../../../../../hooks/use_fetcher';
import { ManagedTable } from '../../../../shared/managed_table';
import { getServiceColumns } from './get_service_columns';

export enum ServiceInventoryFieldName {
  ServiceName = 'serviceName',
  Environments = 'environments',
  Throughput = 'metrics.throughput',
  Latency = 'metrics.latency',
  FailedTransactionRate = 'metrics.failedTransactionRate',
  LogRatePerMinute = 'metrics.logRatePerMinute',
  LogErrorRate = 'metrics.logErrorRate',
}

interface Props {
  status: FETCH_STATUS;
  initialSortField: ServiceInventoryFieldName;
  initialPageSize: number;
  initialSortDirection: 'asc' | 'desc';
  noItemsMessage: React.ReactNode;
  data: [];
}

export function MultiSignalServicesTable({
  status,
  data,
  initialSortField,
  initialPageSize,
  initialSortDirection,
  noItemsMessage,
}: Props) {
  const breakpoints = useBreakpoints();
  const { query } = useApmParams('/services');
  const { link } = useApmRouter();

  const serviceColumns = useMemo(() => {
    return getServiceColumns({
      // removes pagination and sort instructions from the query so it won't be passed down to next route
      query: omit(query, 'page', 'pageSize', 'sortDirection', 'sortField'),
      breakpoints,
      link,
    });
  }, [query, link, breakpoints]);

  return (
    <EuiFlexGroup gutterSize="xs" direction="column" responsive={false}>
      <EuiFlexItem>
        <ManagedTable
          isLoading={isPending(status)}
          error={isFailure(status)}
          columns={serviceColumns}
          items={data.services}
          noItemsMessage={noItemsMessage}
          initialSortField={initialSortField}
          initialSortDirection={initialSortDirection}
          initialPageSize={initialPageSize}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
