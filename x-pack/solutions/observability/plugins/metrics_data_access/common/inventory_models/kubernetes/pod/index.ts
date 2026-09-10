/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { estypes } from '@elastic/elasticsearch';
import { metrics } from './metrics';
import { createInventoryModel } from '../../shared/create_inventory_model';
import type { DataSchemaFormat } from '../../types';
import {
  DATASTREAM_DATASET,
  EVENT_MODULE,
  KUBELET_STATS_RECEIVER_OTEL,
  KUBERNETES_INTEGRATION,
  METRICSET_MODULE,
} from '../../../constants';

export const pod = createInventoryModel('pod', {
  displayName: i18n.translate('xpack.metricsData.inventoryModel.pod.displayName', {
    defaultMessage: 'Kubernetes Pods',
  }),
  singularDisplayName: i18n.translate('xpack.metricsData.inventoryModels.pod.singularDisplayName', {
    defaultMessage: 'Kubernetes Pod',
  }),
  requiredIntegration: {
    beats: 'kubernetes',
    otel: 'kubeletstatsreceiver.otel',
  },
  crosslinkSupport: {
    details: true,
    logs: true,
    apm: true,
    uptime: true,
  },
  fields: {
    id: 'kubernetes.pod.uid',
    name: 'kubernetes.pod.name',
    ip: 'kubernetes.pod.ip',
  },
  metrics,
  nodeFilter: (args?: { schema?: DataSchemaFormat }): estypes.QueryDslQueryContainer[] => {
    const { schema } = args ?? {};
    if (!schema) {
      return [{ term: { [EVENT_MODULE]: KUBERNETES_INTEGRATION } }];
    }

    return [
      {
        bool:
          schema === 'ecs'
            ? {
                should: [
                  {
                    term: {
                      [EVENT_MODULE]: KUBERNETES_INTEGRATION,
                    },
                  },
                  {
                    term: {
                      [METRICSET_MODULE]: KUBERNETES_INTEGRATION,
                    },
                  },
                ],
                minimum_should_match: 1,
              }
            : {
                filter: [
                  {
                    term: {
                      [DATASTREAM_DATASET]: KUBELET_STATS_RECEIVER_OTEL,
                    },
                  },
                ],
              },
      },
    ];
  },
});
