/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo, useState } from 'react';
import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiBasicTable,
  EuiEmptyPrompt,
  EuiLoadingLogo,
  EuiText,
  type CriteriaWithPagination,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import type { HttpStart } from '@kbn/core/public';
import type { Entity } from '@kbn/entity-store/common';
import { useInfrastructureEntities } from './use_infrastructure_entities';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const columns: Array<EuiBasicTableColumn<Entity>> = [
  {
    field: 'entity.name',
    name: i18n.translate('xpack.infrastructureEntities.table.nameColumn', {
      defaultMessage: 'Name',
    }),
    sortable: true,
  },
  {
    field: 'entity.type',
    name: i18n.translate('xpack.infrastructureEntities.table.typeColumn', {
      defaultMessage: 'Type',
    }),
    sortable: true,
  },
  {
    field: 'entity.id',
    name: i18n.translate('xpack.infrastructureEntities.table.idColumn', {
      defaultMessage: 'Entity ID',
    }),
  },
  {
    field: 'entity.source',
    name: i18n.translate('xpack.infrastructureEntities.table.sourceColumn', {
      defaultMessage: 'Sources',
    }),
    render: (source: string[] | undefined) => source?.join(', ') ?? '—',
  },
];

export const EntitiesTable = ({ http }: { http: HttpStart }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const { entities, total, isLoading, error } = useInfrastructureEntities(http, {
    pageIndex,
    pageSize,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
      totalItemCount: total,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
    }),
    [pageIndex, pageSize, total]
  );

  const onTableChange = ({ page }: CriteriaWithPagination<Entity>) => {
    setPageIndex(page.index);
    setPageSize(page.size);
  };

  if (error) {
    return (
      <EuiEmptyPrompt
        iconType="warning"
        color="warning"
        title={
          <h2>
            <FormattedMessage
              id="xpack.infrastructureEntities.table.errorTitle"
              defaultMessage="Could not load infrastructure entities"
            />
          </h2>
        }
        body={
          <EuiText size="s">
            <p>
              <FormattedMessage
                id="xpack.infrastructureEntities.table.errorBody"
                defaultMessage="The Entity Store did not return any entities. Make sure Entity Store v2 is enabled and installed, then try again."
              />
            </p>
            <p>{error.message}</p>
          </EuiText>
        }
      />
    );
  }

  if (isLoading && entities.length === 0) {
    return (
      <EuiEmptyPrompt
        icon={<EuiLoadingLogo logo="logoObservability" size="xl" />}
        title={
          <h2>
            <FormattedMessage
              id="xpack.infrastructureEntities.table.loadingTitle"
              defaultMessage="Loading infrastructure entities"
            />
          </h2>
        }
      />
    );
  }

  if (total === 0) {
    return (
      <EuiEmptyPrompt
        iconType="database"
        title={
          <h2>
            <FormattedMessage
              id="xpack.infrastructureEntities.table.emptyTitle"
              defaultMessage="No infrastructure entities yet"
            />
          </h2>
        }
        body={
          <FormattedMessage
            id="xpack.infrastructureEntities.table.emptyBody"
            defaultMessage="Entities appear here once the Entity Store has extracted them from your infrastructure data."
          />
        }
      />
    );
  }

  return (
    <EuiBasicTable
      data-test-subj="infrastructureEntitiesTable"
      tableCaption={i18n.translate('xpack.infrastructureEntities.table.caption', {
        defaultMessage: 'Infrastructure entities',
      })}
      items={entities}
      columns={columns}
      pagination={pagination}
      loading={isLoading}
      onChange={onTableChange}
    />
  );
};
