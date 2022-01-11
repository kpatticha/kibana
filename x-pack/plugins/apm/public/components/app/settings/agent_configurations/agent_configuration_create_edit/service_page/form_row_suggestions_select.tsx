/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiDescribedFormGroup, EuiFormRow } from '@elastic/eui';
import React from 'react';
import { i18n } from '@kbn/i18n';
import { SuggestionsSelect } from '../../../../../shared/suggestions_select';
import { allOption } from '../../../../../../../common/select_all_option';

interface Props {
  title: string;
  esField: string;
  description: string;
  fieldLabel: string;
  value?: string;
  allowAll?: boolean;
  onChange: (value?: string) => void;
}

export function FormRowSuggestionsSelect({
  title,
  esField,
  description,
  fieldLabel,
  value,
  allowAll = true,
  onChange,
}: Props) {
  return (
    <EuiDescribedFormGroup
      fullWidth
      title={<h3>{title}</h3>}
      description={description}
    >
      <EuiFormRow label={fieldLabel}>
        <SuggestionsSelect
          allOption={allowAll ? allOption : undefined}
          defaultValue={value}
          field={esField}
          onChange={onChange}
          isClearable={false}
          placeholder={i18n.translate(
            'xpack.apm.agentConfig.servicePage.service.placeholder',
            { defaultMessage: 'Select Option' }
          )}
        />
      </EuiFormRow>
    </EuiDescribedFormGroup>
  );
}
