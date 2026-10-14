/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiPageSection, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import type { CoreStart } from '@kbn/core/public';
import { EntitiesTable } from './entities_table';
import { SwitchSuccessCallout } from './switch_success_callout';

export const InfrastructureEntitiesApp = ({ coreStart }: { coreStart: CoreStart }) => (
  <EuiPageSection restrictWidth={false}>
    <SwitchSuccessCallout application={coreStart.application} />
    <EuiTitle size="l">
      <h1>
        <FormattedMessage
          id="xpack.infrastructureEntities.pageTitle"
          defaultMessage="Infrastructure entities"
        />
      </h1>
    </EuiTitle>
    <EuiSpacer size="s" />
    <EuiText color="subdued" size="s">
      <p>
        <FormattedMessage
          id="xpack.infrastructureEntities.pageDescription"
          defaultMessage="Hosts, containers and other infrastructure entities resolved by the Entity Store."
        />
      </p>
    </EuiText>
    <EuiSpacer size="l" />
    <EntitiesTable http={coreStart.http} />
  </EuiPageSection>
);
