/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  CountIndexPatternColumn,
  TermsIndexPatternColumn,
  PersistedIndexPatternLayer,
  PieVisualizationState,
  TypedLensByValueInput,
} from '@kbn/lens-plugin/public';
import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { APM_STATIC_DATA_VIEW_ID } from '../../../../../../common/data_view_constants';
import { MostUsedMetric } from './';

const BUCKET_SIZE = 5;

export function getLensAttributes({
  metric,
  filters,
  kuery,
}: {
  metric: MostUsedMetric;
  filters: QueryDslQueryContainer[];
  kuery: string;
}): TypedLensByValueInput['attributes'] {
  const metricId = metric.replaceAll('.', '-');
  const dataLayer: PersistedIndexPatternLayer = {
    columnOrder: ['termsColumn', 'countColumn'],
    columns: {
      termsColumn: {
        label: `Top ${BUCKET_SIZE} values of ${metric}`,
        dataType: 'string',
        operationType: 'terms',
        scale: 'ordinal',
        sourceField: metric,
        isBucketed: true,
        params: {
          size: BUCKET_SIZE,
          orderBy: {
            type: 'column',
            columnId: 'countColumn',
          },
          orderDirection: 'desc',
        },
      } as TermsIndexPatternColumn,
      countColumn: {
        label: 'Count of records',
        dataType: 'number',
        operationType: 'count',
        scale: 'ratio',
        isBucketed: false,
        sourceField: '___records___',
      } as CountIndexPatternColumn,
    },
  };

  return {
    title: `most-used-${metricId}`,
    visualizationType: 'lnsPie',
    references: [
      {
        type: 'index-pattern',
        id: APM_STATIC_DATA_VIEW_ID,
        name: `indexpattern-datasource-layer-${metricId}`,
      },
    ],
    state: {
      visualization: {
        shape: 'pie',
        layers: [
          {
            layerId: metricId,
            primaryGroups: ['termsColumn'],
            metric: 'countColumn',
            categoryDisplay: 'default',
            legendDisplay: 'hide',
            numberDisplay: 'percent',
            layerType: 'data',
          },
        ],
      } as PieVisualizationState,
      datasourceStates: {
        formBased: {
          layers: {
            [metricId]: dataLayer,
          },
        },
      },
      filters: [
        {
          meta: {},
          query: {
            bool: {
              filter: [...filters],
            },
          },
        },
      ],
      query: { language: 'kuery', query: kuery },
    },
  };
}
