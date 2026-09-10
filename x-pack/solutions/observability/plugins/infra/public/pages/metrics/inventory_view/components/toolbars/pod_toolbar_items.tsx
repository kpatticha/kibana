/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { MetricsAndGroupByToolbarItems } from './metrics_and_groupby_toolbar_items';
import type { ToolbarProps } from './types';

export const ecsPodGroupByFields = ['kubernetes.namespace', 'kubernetes.node.name', 'service.type'];

// `kubernetes.namespace` and `kubernetes.node.name` resolve on OTel data streams
// through the semconv-resource-to-ecs alias mappings; `service.type` is beats-only.
export const semconvPodGroupByFields = ['kubernetes.namespace', 'kubernetes.node.name'];

export const PodToolbarItems = (props: ToolbarProps) => {
  return (
    <MetricsAndGroupByToolbarItems
      {...props}
      groupByFields={
        props.preferredSchema === 'semconv' ? semconvPodGroupByFields : ecsPodGroupByFields
      }
      allowSchemaSelection
    />
  );
};
