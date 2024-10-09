/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import {
  EuiBadge,
  EuiDataGrid,
  EuiDataGridCellValueElementProps,
  EuiDataGridSorting,
  EuiLink,
  EuiLoadingSpinner,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedDate, FormattedMessage, FormattedTime } from '@kbn/i18n-react';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import type { SharePluginStart } from '@kbn/share-plugin/public';
import {
  ASSET_DETAILS_LOCATOR_ID,
  type AssetDetailsLocatorParams,
  type ServiceOverviewParams,
} from '@kbn/observability-shared-plugin/common';

import { last } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { Entity, EntityColumnIds, EntityType } from '../../../common/entities';
import {
  ENTITY_DISPLAY_NAME,
  ENTITY_LAST_SEEN,
  ENTITY_TYPE,
} from '../../../common/es_fields/entities';
import { APIReturnType } from '../../api';
import { getEntityTypeLabel } from '../../utils/get_entity_type_label';
import { parseServiceParams } from '../../utils/parse_service_params';
import { BadgeFilterWithPopover } from '../badge_filter_with_popover';
import { getColumns } from './grid_columns';

type InventoryEntitiesAPIReturnType = APIReturnType<'GET /internal/inventory/entities'>;

type LatestEntities = InventoryEntitiesAPIReturnType['entities'];
type LatestEntity = LatestEntities extends Array<infer Entity> ? Entity : never;

interface Props {
  loading: boolean;
  entities: LatestEntities;
  sortDirection: 'asc' | 'desc';
  sortField: string;
  pageIndex: number;
  onChangeSort: (sorting: EuiDataGridSorting['columns'][0]) => void;
  onChangePage: (nextPage: number) => void;
  onFilterByType: (entityType: EntityType) => void;
}

const PAGE_SIZE = 20;

export function EntitiesGrid({
  entities,
  loading,
  sortDirection,
  sortField,
  pageIndex,
  onChangePage,
  onChangeSort,
  onFilterByType,
}: Props) {
  const { services } = useKibana<{ share?: SharePluginStart }>();

  const assetDetailsLocator =
    services.share?.url.locators.get<AssetDetailsLocatorParams>(ASSET_DETAILS_LOCATOR_ID);

  const serviceOverviewLocator =
    services.share?.url.locators.get<ServiceOverviewParams>('serviceOverviewLocator');

  const onSort: EuiDataGridSorting['onSort'] = useCallback(
    (newSortingColumns) => {
      const lastItem = last(newSortingColumns);
      if (lastItem) {
        onChangeSort(lastItem);
      }
    },
    [onChangeSort]
  );

  const getEntityRedirectUrl = useCallback(
    (entity: LatestEntity) => {
      const type = entity[ENTITY_TYPE] as EntityType;

      // Any unrecognised types will always return undefined
      switch (type) {
        case 'host':
        case 'container':
          return assetDetailsLocator?.getRedirectUrl({
            assetId: entity[ENTITY_DISPLAY_NAME],
            assetType: type,
          });

        case 'service':
          // For services, the format of the display name is `service.name:service.environment`.
          // We just want the first part of the name for the locator.
          // TODO: Replace this with a better approach for handling service names. See https://github.com/elastic/kibana/issues/194131
          return serviceOverviewLocator?.getRedirectUrl(
            parseServiceParams(entity[ENTITY_DISPLAY_NAME])
          );
      }
    },
    [assetDetailsLocator, serviceOverviewLocator]
  );

  const showAlertsColumn = useMemo(
    () => entities?.some((entity: Entity) => entity?.alertsCount && entity?.alertsCount > 0),
    [entities]
  );

  const visibleColumns = useMemo(
    () => getColumns({ showAlertsColumn }).map(({ id }) => id),
    [showAlertsColumn]
  );

  const columnVisibility = useMemo(
    () => ({
      visibleColumns,
      setVisibleColumns: () => {},
    }),
    [visibleColumns]
  );

  const renderCellValue = useCallback(
    ({ rowIndex, columnId }: EuiDataGridCellValueElementProps) => {
      const entity = entities[rowIndex];
      if (entity === undefined) {
        return null;
      }

      const columnEntityTableId = columnId as EntityColumnIds;
      switch (columnEntityTableId) {
        case 'alertsCount':
          return entity?.alertsCount ? (
            <EuiToolTip
              position="bottom"
              content={i18n.translate(
                'xpack.inventory.home.serviceAlertsTable.tooltip.activeAlertsExplanation',
                {
                  defaultMessage: 'Active alerts',
                }
              )}
            >
              <EuiBadge iconType="warning" color="danger">
                {entity.alertsCount}
              </EuiBadge>
            </EuiToolTip>
          ) : null;

        case ENTITY_TYPE:
          const entityType = entity[columnEntityTableId] as EntityType;
          return (
            <BadgeFilterWithPopover
              field={ENTITY_TYPE}
              value={entityType}
              label={getEntityTypeLabel(entityType)}
              onFilter={() => onFilterByType(entityType)}
            />
          );
        case ENTITY_LAST_SEEN:
          return (
            <FormattedMessage
              id="xpack.inventory.entitiesGrid.euiDataGrid.lastSeen"
              defaultMessage="{date} @ {time}"
              values={{
                date: (
                  <FormattedDate
                    value={entity[columnEntityTableId]}
                    month="short"
                    day="numeric"
                    year="numeric"
                  />
                ),
                time: (
                  <FormattedTime
                    value={entity[columnEntityTableId]}
                    hour12={false}
                    hour="2-digit"
                    minute="2-digit"
                    second="2-digit"
                  />
                ),
              }}
            />
          );
        case ENTITY_DISPLAY_NAME:
          return (
            <EuiLink
              data-test-subj="inventoryCellValueLink"
              className="eui-textTruncate"
              href={getEntityRedirectUrl(entity)}
            >
              {entity[columnEntityTableId]}
            </EuiLink>
          );
        default:
          return entity[columnId as EntityColumnIds] || '';
      }
    },
    [entities, onFilterByType, getEntityRedirectUrl]
  );

  if (loading) {
    return <EuiLoadingSpinner size="s" />;
  }

  const currentPage = pageIndex + 1;

  return (
    <EuiDataGrid
      aria-label={i18n.translate(
        'xpack.inventory.entitiesGrid.euiDataGrid.inventoryEntitiesGridLabel',
        { defaultMessage: 'Inventory entities grid' }
      )}
      columns={getColumns({ showAlertsColumn })}
      columnVisibility={columnVisibility}
      rowCount={entities.length}
      renderCellValue={renderCellValue}
      gridStyle={{ border: 'horizontal', header: 'shade' }}
      toolbarVisibility={{
        showColumnSelector: false,
        showSortSelector: false,
        additionalControls: {
          left: {
            prepend: (
              <EuiText size="s">
                <FormattedMessage
                  id="xpack.inventory.entitiesGrid.euiDataGrid.headerLeft"
                  defaultMessage="Showing {currentItems} of {total} {boldEntites}"
                  values={{
                    currentItems: (
                      <strong>
                        {Math.min(entities.length, pageIndex * PAGE_SIZE + 1)}-
                        {Math.min(entities.length, PAGE_SIZE * currentPage)}
                      </strong>
                    ),
                    total: entities.length,
                    boldEntites: (
                      <strong>
                        {i18n.translate(
                          'xpack.inventory.entitiesGrid.euiDataGrid.headerLeft.entites',
                          { defaultMessage: 'Entities' }
                        )}
                      </strong>
                    ),
                  }}
                />
              </EuiText>
            ),
          },
        },
      }}
      sorting={{ columns: [{ id: sortField, direction: sortDirection }], onSort }}
      pagination={{
        pageIndex,
        pageSize: PAGE_SIZE,
        onChangeItemsPerPage: () => {},
        onChangePage,
        pageSizeOptions: [],
      }}
    />
  );
}
