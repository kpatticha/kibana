/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiButton } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { IBasePath } from '@kbn/core/public';
import { useKibana } from '../../../context/kibana_context/use_kibana';
import { useApmPluginContext } from '../../../context/apm_plugin/use_apm_plugin_context';

export const addApmAgent = {
  name: i18n.translate('xpack.apm.add.apm.agent.button.', {
    defaultMessage: 'Add APM agent',
  }),
  link: '/app/observabilityOnboarding/?category=apm',
};

export const associateServiceLogs = {
  name: i18n.translate('xpack.apm.associate.service.logs.button', {
    defaultMessage: 'Associate existing service logs',
  }),
  link: 'https://ela.st/new-experience-associate-service-logs',
};

export const collectServiceLogs = {
  name: i18n.translate('xpack.apm.collect.service.logs.button', {
    defaultMessage: 'Collect new service logs',
  }),
  link: '/app/observabilityOnboarding/customLogs/?category=logs',
};

export function AddApmAgent({ basePath, onClick }: { basePath: IBasePath; onClick?: () => void }) {
  function handleClick() {
    window.open(basePath.prepend(addApmAgent.link), '_blank');
    onClick?.();
  }
  return (
    <EuiButton data-test-subj="addApmAgentButton" size="s" onClick={handleClick}>
      {addApmAgent.name}
    </EuiButton>
  );
}

export function AssociateServiceLogs({ onClick }: { onClick?: () => void }) {
  function handleClick() {
    window.open(associateServiceLogs.link, '_blank');
    onClick?.();
  }
  return (
    <EuiButton data-test-subj="associateServiceLogsButton" size="s" onClick={handleClick}>
      {associateServiceLogs.name}
    </EuiButton>
  );
}

export function CollectServiceLogs({ onClick }: { onClick?: () => void }) {
  const { core } = useApmPluginContext();
  const { basePath } = core.http;
  const {
    application: { navigateToUrl },
  } = useKibana().services;

  function handleClick() {
    navigateToUrl(basePath.prepend(collectServiceLogs.link));
    onClick?.();
  }
  return (
    <EuiButton data-test-subj="collectServiceLogsButton" size="s" onClick={handleClick}>
      {collectServiceLogs.name}
    </EuiButton>
  );
}
