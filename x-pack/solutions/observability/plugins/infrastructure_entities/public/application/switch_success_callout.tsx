/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiText } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import type { ApplicationStart } from '@kbn/core/public';
import { INFRASTRUCTURE_ENTITIES_SWITCHED_PARAM } from '@kbn/deeplinks-observability';

const ADVANCED_SETTINGS_PATH = 'kibana/settings?query=Infrastructure%20entities';

/**
 * Confirms the switch for the user who just came from the legacy Infrastructure pages. The query
 * param is stripped on mount so the callout does not reappear on reload or when the URL is shared.
 */
export const SwitchSuccessCallout = ({ application }: { application: ApplicationStart }) => {
  const history = useHistory();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);

    if (params.get(INFRASTRUCTURE_ENTITIES_SWITCHED_PARAM) !== 'true') {
      return;
    }

    setVisible(true);
    params.delete(INFRASTRUCTURE_ENTITIES_SWITCHED_PARAM);
    const search = params.toString();
    history.replace({ ...history.location, search: search ? `?${search}` : '' });
  }, [history]);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const revert = useCallback(() => {
    application.navigateToApp('management', { path: ADVANCED_SETTINGS_PATH });
  }, [application]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <EuiCallOut
        color="primary"
        data-test-subj="infrastructureEntitiesSwitchSuccessCallout"
        title={i18n.translate('xpack.infrastructureEntities.switchSuccess.title', {
          defaultMessage: '🎉 Your infrastructure view has been updated',
        })}
      >
        <EuiText size="s">
          <p>
            <FormattedMessage
              id="xpack.infrastructureEntities.switchSuccess.description"
              defaultMessage="You've successfully enabled the new infrastructure experience for everyone in this space. It brings faster load times, hex map visualizations, and richer flyout context."
            />
          </p>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiFlexGroup gutterSize="l" responsive={false} alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiLink
              onClick={revert}
              data-test-subj="infrastructureEntitiesSwitchSuccessRevertLink"
            >
              <FormattedMessage
                id="xpack.infrastructureEntities.switchSuccess.revert"
                defaultMessage="Revert in Advanced Settings"
              />
            </EuiLink>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiLink
              onClick={dismiss}
              data-test-subj="infrastructureEntitiesSwitchSuccessDismissLink"
            >
              <FormattedMessage
                id="xpack.infrastructureEntities.switchSuccess.dismiss"
                defaultMessage="Dismiss"
              />
            </EuiLink>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiCallOut>
      <EuiSpacer size="l" />
    </>
  );
};
