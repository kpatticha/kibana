/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { estypes } from '@elastic/elasticsearch';
import { DataPublicPluginStart } from '@kbn/data-plugin/public';
import { DataView, DataViewField } from '@kbn/data-views-plugin/public';
import { AggregateQuery, Filter, Query, TimeRange } from '@kbn/es-query';
import { PublishesDataViews, PublishingSubject } from '@kbn/presentation-publishing';
import { combineLatest, lastValueFrom, switchMap, tap } from 'rxjs';
import { ControlGroupApi } from '../../control_group/types';

export function minMax$({
  data,
  dataControlFetch$,
  dataViews$,
  fieldName$,
  setIsLoading,
}: {
  data: DataPublicPluginStart;
  dataControlFetch$: ControlGroupApi['dataControlFetch$'];
  dataViews$: PublishesDataViews['dataViews'];
  fieldName$: PublishingSubject<string>;
  setIsLoading: (isLoading: boolean) => void;
}) {
  let prevRequestAbortController: AbortController | undefined;
  return combineLatest([dataViews$, fieldName$, dataControlFetch$]).pipe(
    tap(() => {
      if (prevRequestAbortController) {
        prevRequestAbortController.abort();
        prevRequestAbortController = undefined;
      }
    }),
    switchMap(async ([dataViews, fieldName, dataControlFetchContext]) => {
      const dataView = dataViews?.[0];
      const dataViewField = dataView && fieldName ? dataView.getFieldByName(fieldName) : undefined;
      if (!dataView || !dataViewField) {
        return { max: undefined, min: undefined };
      }

      try {
        setIsLoading(true);
        const abortController = new AbortController();
        prevRequestAbortController = abortController;
        return await getMinMax({
          abortSignal: abortController.signal,
          data,
          dataView,
          field: dataViewField,
          ...dataControlFetchContext,
        });
      } catch (error) {
        return { error, max: undefined, min: undefined };
      }
    }),
    tap(() => {
      setIsLoading(false);
    })
  );
}

export async function getMinMax({
  abortSignal,
  data,
  dataView,
  field,
  unifiedSearchFilters,
  query,
  timeRange,
}: {
  abortSignal: AbortSignal;
  data: DataPublicPluginStart;
  dataView: DataView;
  field: DataViewField;
  unifiedSearchFilters?: Filter[];
  query?: Query | AggregateQuery;
  timeRange?: TimeRange;
}): Promise<{ min: number | undefined; max: number | undefined }> {
  const searchSource = await data.search.searchSource.create();
  searchSource.setField('size', 0);
  searchSource.setField('index', dataView);

  const allFilters = unifiedSearchFilters ? unifiedSearchFilters : [];
  if (timeRange) {
    const timeFilter = data.query.timefilter.timefilter.createFilter(dataView, timeRange);
    if (timeFilter) allFilters.push(timeFilter);
  }
  if (allFilters.length) {
    searchSource.setField('filter', allFilters);
  }

  if (query) {
    searchSource.setField('query', query);
  }

  const aggBody: any = {};
  if (field.scripted) {
    aggBody.script = {
      source: field.script,
      lang: field.lang,
    };
  } else {
    aggBody.field = field.name;
  }

  const aggs = {
    maxAgg: {
      max: aggBody,
    },
    minAgg: {
      min: aggBody,
    },
  };
  searchSource.setField('aggs', aggs);

  const resp = await lastValueFrom(searchSource.fetch$({ abortSignal }));
  return {
    min:
      (resp.rawResponse?.aggregations?.minAgg as estypes.AggregationsSingleMetricAggregateBase)
        ?.value ?? undefined,
    max:
      (resp.rawResponse?.aggregations?.maxAgg as estypes.AggregationsSingleMetricAggregateBase)
        ?.value ?? undefined,
  };
}
