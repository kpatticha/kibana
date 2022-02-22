/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { i18n } from '@kbn/i18n';
import { UiSettingsParams } from '../../../../src/core/types';
import { observabilityFeatureId } from '../common';
import {
  enableComparisonByDefault,
  enableInspectEsQueries,
  maxSuggestions,
  maxNumServices,
  enableInfrastructureView,
} from '../common/ui_settings_keys';

/**
 * uiSettings definitions for Observability.
 */
export const uiSettings: Record<string, UiSettingsParams<boolean | number>> = {
  [enableInspectEsQueries]: {
    category: [observabilityFeatureId],
    name: i18n.translate('xpack.observability.enableInspectEsQueriesExperimentName', {
      defaultMessage: 'Inspect ES queries',
    }),
    value: false,
    description: i18n.translate('xpack.observability.enableInspectEsQueriesExperimentDescription', {
      defaultMessage: 'Inspect Elasticsearch queries in API responses.',
    }),
    schema: schema.boolean(),
  },
  [maxSuggestions]: {
    category: [observabilityFeatureId],
    name: i18n.translate('xpack.observability.maxSuggestionsUiSettingName', {
      defaultMessage: 'Maximum suggestions',
    }),
    value: 100,
    description: i18n.translate('xpack.observability.maxSuggestionsUiSettingDescription', {
      defaultMessage: 'Maximum number of suggestions fetched in autocomplete selection boxes.',
    }),
    schema: schema.number(),
  },
  [maxNumServices]: {
    category: [observabilityFeatureId],
    name: i18n.translate('xpack.observability.maxNumServicesUiSettingName', {
      defaultMessage: 'Maximum services',
    }),
    value: 50,
    description: i18n.translate('xpack.observability.maxNumServicesUiSettingDescription', {
      defaultMessage: 'Maximum number of services displayed in the Services inventory',
    }),
    schema: schema.number(),
  },
  [enableComparisonByDefault]: {
    category: [observabilityFeatureId],
    name: i18n.translate('xpack.observability.enableComparisonByDefault', {
      defaultMessage: 'Comparison feature',
    }),
    value: true,
    description: i18n.translate('xpack.observability.enableComparisonByDefaultDescription', {
      defaultMessage: 'Enable the comparison feature in APM app',
    }),
    schema: schema.boolean(),
  },
  [enableInfrastructureView]: {
    category: [observabilityFeatureId],
    name: i18n.translate('xpack.observability.enableInfrastructureView', {
      defaultMessage: 'Infrastructure feature',
    }),
    value: true,
    description: i18n.translate('xpack.observability.enableInfrastructureViewDescription', {
      defaultMessage: 'Enable the Infrastruture view feature in APM app',
    }),
    schema: schema.boolean(),
  },
};
