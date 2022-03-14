/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';
import { debounce } from 'lodash';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { FETCH_STATUS, useFetcher } from '../../../hooks/use_fetcher';

interface ServiceEnvironmentSuggestionsSelectProps {
  customOptions?: Array<EuiComboBoxOptionOption<string>>;
  customOptionText?: string;
  defaultValue?: string;
  fieldName: string;
  serviceName: string;
  start?: string;
  end?: string;
  onChange: (value?: string) => void;
  isClearable?: boolean;
  placeholder: string;
  prepend?: string;
}

export function ServiceEnvironmentSuggestionsSelect({
  customOptions,
  customOptionText,
  defaultValue,
  fieldName,
  serviceName,
  start,
  end,
  onChange,
  isClearable,
  placeholder,
  prepend,
}: ServiceEnvironmentSuggestionsSelectProps) {
  let defaultOption: EuiComboBoxOptionOption<string> | undefined;

  if (defaultValue) {
    defaultOption = { label: defaultValue, value: defaultValue };
  }
  const [selectedOptions, setSelectedOptions] = useState(
    defaultOption ? [defaultOption] : []
  );

  const [searchValue, setSearchValue] = useState('');

  const { data, status } = useFetcher(
    (callApmApi) => {
      return callApmApi('GET /internal/apm/suggestions_by_service_name', {
        params: {
          query: {
            fieldName,
            fieldValue: searchValue,
            serviceName,
            start,
            end,
          },
        },
      });
    },
    [fieldName, searchValue, serviceName, start, end],
    { preservePreviousData: false }
  );

  const handleChange = useCallback(
    (changedOptions: Array<EuiComboBoxOptionOption<string>>) => {
      setSelectedOptions(changedOptions);
      if (changedOptions.length === 1) {
        onChange(
          changedOptions[0].value
            ? changedOptions[0].value.trim()
            : changedOptions[0].value
        );
      }
    },
    [onChange]
  );

  const handleCreateOption = useCallback(
    (value: string) => {
      handleChange([{ label: value, value }]);
    },
    [handleChange]
  );

  const terms: string[] = useMemo(() => data?.terms ?? [], [data]);

  useEffect(() => {
    if (terms.length === 1) {
      const [term] = terms;
      handleChange([{ label: term, value: term }]);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [terms]);

  const options: Array<EuiComboBoxOptionOption<string>> = [
    ...(customOptions ? customOptions : []),
    ...terms.map((name) => {
      return { label: name, value: name };
    }),
  ];

  return (
    <EuiComboBox
      async={true}
      customOptionText={customOptionText}
      isClearable={isClearable}
      isLoading={status === FETCH_STATUS.LOADING}
      onChange={handleChange}
      onCreateOption={handleCreateOption}
      onSearchChange={debounce(setSearchValue, 500)}
      options={options}
      placeholder={placeholder}
      selectedOptions={selectedOptions}
      singleSelection={{ asPlainText: true }}
      style={{ minWidth: '256px' }}
      prepend={prepend}
    />
  );
}
