/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiComboBoxOptionOption } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { ENVIRONMENT_ALL } from './environment_filter_values';

const allOptionText = i18n.translate('xpack.apm.alerting.fields.allOption', {
  defaultMessage: 'All',
});

export const allOption: EuiComboBoxOptionOption<string> = {
  label: allOptionText,
  value: allOptionText,
};

export const environmentAllOption: EuiComboBoxOptionOption<string> = {
  label: ENVIRONMENT_ALL.text,
  value: ENVIRONMENT_ALL.value,
};
