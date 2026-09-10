/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexItem } from '@elastic/eui';
import React, { useEffect, useMemo } from 'react';
import { i18n } from '@kbn/i18n';
import type {
  DataSchemaFormat,
  InventoryItemType,
  SnapshotMetricType,
} from '@kbn/metrics-data-access-plugin/common';
import { findInventoryModel } from '@kbn/metrics-data-access-plugin/common';
import useAsync from 'react-use/lib/useAsync';
import { DEFAULT_SCHEMA } from '../../../../../../common/constants';
import { useTimeRangeMetadataContext } from '../../../../../hooks/use_time_range_metadata';
import { SchemaSelector } from '../../../../../components/schema_selector';
import { toMetricOpt } from '../../../../../../common/snapshot_metric_i18n';
import { WaffleMetricControls } from '../waffle/metric_control';
import { WaffleGroupByControls } from '../waffle/waffle_group_by_controls';
import { WaffleSortControls } from '../waffle/waffle_sort_controls';
import type { ToolbarProps } from './types';
import { SupportedDataTooltipLink } from '../../../../../components/supported_data_tooltip_link';

interface Props extends ToolbarProps {
  groupByFields: string[];
  allowSchemaSelection?: boolean;
}

const SCHEMA_HELP_TEXT_BY_NODE_TYPE: Partial<Record<InventoryItemType, string>> = {
  host: i18n.translate('xpack.infra.schemaSelector.select.hostsHelpText', {
    defaultMessage: 'There are hosts available in another schema',
  }),
  pod: i18n.translate('xpack.infra.schemaSelector.select.podsHelpText', {
    defaultMessage: 'There are pods available in another schema',
  }),
};

export const MetricsAndGroupByToolbarItems = ({
  preferredSchema,
  changePreferredSchema,
  allowSchemaSelection = false,
  ...props
}: Props) => {
  const inventoryModel = findInventoryModel(props.nodeType);
  const { data: timeRangeMetadata, loading = false } = useTimeRangeMetadataContext();

  const schemas: DataSchemaFormat[] = useMemo(
    () => timeRangeMetadata?.schemas || [],
    [timeRangeMetadata?.schemas]
  );

  useEffect(() => {
    if (!allowSchemaSelection || !timeRangeMetadata?.preferredSchema || schemas.length === 0) {
      return;
    }

    if (preferredSchema === null) {
      changePreferredSchema(timeRangeMetadata.preferredSchema);
    }
  }, [
    allowSchemaSelection,
    changePreferredSchema,
    preferredSchema,
    schemas,
    timeRangeMetadata?.preferredSchema,
  ]);

  const { value: aggregations } = useAsync(
    () => inventoryModel.metrics.getAggregations({ schema: preferredSchema ?? DEFAULT_SCHEMA }),
    [inventoryModel.metrics, preferredSchema]
  );

  const metricOptions = useMemo(
    () =>
      (Object.keys(aggregations?.getAll() ?? {}) as SnapshotMetricType[])
        .map((metric) => toMetricOpt(metric, props.nodeType))
        .filter((v) => v) as Array<{ text: string; value: string }>,
    [aggregations, props.nodeType]
  );

  const groupByOptions = useMemo(
    () => props.groupByFields.map((field) => ({ text: field, field })),
    [props.groupByFields]
  );

  return (
    <>
      <EuiFlexItem grow={false}>
        <WaffleMetricControls
          options={metricOptions}
          metric={props.metric}
          onChange={props.changeMetric}
          onChangeCustomMetrics={props.changeCustomMetrics}
          customMetrics={props.customMetrics}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <WaffleGroupByControls
          options={groupByOptions}
          groupBy={props.groupBy}
          nodeType={props.nodeType}
          onChange={props.changeGroupBy}
          onChangeCustomOptions={props.changeCustomOptions}
          customOptions={props.customOptions}
        />
      </EuiFlexItem>

      {props.view === 'map' && (
        <EuiFlexItem grow={false}>
          <WaffleSortControls sort={props.sort} onChange={props.changeSort} />
        </EuiFlexItem>
      )}

      {allowSchemaSelection && (
        <EuiFlexItem grow={false}>
          <SchemaSelector
            value={preferredSchema ?? DEFAULT_SCHEMA}
            schemas={schemas}
            isLoading={loading}
            onChange={changePreferredSchema}
            helpText={SCHEMA_HELP_TEXT_BY_NODE_TYPE[props.nodeType]}
          />
        </EuiFlexItem>
      )}
      <EuiFlexItem grow={false}>
        <SupportedDataTooltipLink nodeType={props.nodeType} />
      </EuiFlexItem>
    </>
  );
};
