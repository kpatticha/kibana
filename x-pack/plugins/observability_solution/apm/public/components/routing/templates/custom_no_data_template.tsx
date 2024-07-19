/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiTextColor,
  EuiText,
  EuiButton,
  EuiPageTemplate,
  EuiCard,
  EuiImage,
  EuiScreenReaderOnly,
} from '@elastic/eui';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import { TechnicalPreviewBadge } from '@kbn/observability-shared-plugin/public';
import React from 'react';
import { i18n } from '@kbn/i18n';
import { KibanaSolutionAvatar } from '@kbn/shared-ux-avatar-solution';
import { NoDataConfig } from '@kbn/shared-ux-page-no-data-config-types';
import { useHistory } from 'react-router-dom';
import { ApmPluginStartDeps } from '../../../plugin';
import { useEntityManagerEnablementContext } from '../../../context/entity_manager_context/use_entity_manager_enablement_context';

export function CustomNoDataTemplate({
  isPageDataLoaded,
  noDataConfig,
}: {
  isPageDataLoaded: boolean;
  noDataConfig: NoDataConfig;
}) {
  const { services } = useKibana<ApmPluginStartDeps>();
  const { http, observabilityShared } = services;
  const basePath = http?.basePath.get();
  const history = useHistory();

  const { setServiceInventoryViewLocalStorageSetting } = useEntityManagerEnablementContext();

  const ObservabilityPageTemplate = observabilityShared.navigation.PageTemplate;
  const imageUrl = `${basePath}/plugins/kibanaReact/assets/elastic_agent_card.svg`;

  const handleEnablement = () => {
    setServiceInventoryViewLocalStorageSetting('entity');
    history.push('/services');
    // window.location.replace(`${basePath}/app/apm/services`);
  };
  return (
    <ObservabilityPageTemplate isPageDataLoaded={isPageDataLoaded} paddingSize="none">
      <EuiPageTemplate panelled={false} offset={0} restrictWidth="960px">
        <EuiPageTemplate.Section alignment="center" component="div" grow>
          <EuiText textAlign="center">
            <KibanaSolutionAvatar name="observability" iconType="logoObservability" size="xxl" />
            <EuiSpacer size="l" />
            <h1>
              {i18n.translate('xpack.apm.customEmtpyState.title', {
                defaultMessage: 'Detect and resolve problems with your application',
              })}
            </h1>
            <EuiTextColor color="subdued">
              <p>
                {i18n.translate('xpack.apm.customEmtpyState.description', {
                  defaultMessage:
                    'Start collecting data for your applications and services so you can detect and resolve problems faster.',
                })}
              </p>
            </EuiTextColor>
          </EuiText>
          <EuiSpacer size="xxl" />
          <EuiCard
            css={{ maxWidth: 400, marginInline: 'auto' }}
            paddingSize="l"
            title={
              <EuiScreenReaderOnly>
                <span>
                  {i18n.translate('xpack.apm.customEmtpyState.title.reader', {
                    defaultMessage: 'Add APM data',
                  })}
                </span>
              </EuiScreenReaderOnly>
            }
            description={i18n.translate('xpack.apm.customEmtpyState.card.description', {
              defaultMessage:
                'Use APM agents to collect APM data. We make it easy with agents for many popular languages.',
            })}
            footer={
              <EuiFlexGroup justifyContent="center">
                <EuiFlexItem grow={false}>
                  <EuiButton
                    data-test-subj="apmCustomNoDataTemplateAddApmAgentButton"
                    color="primary"
                    fill
                    href={noDataConfig?.action.elasticAgent.href}
                  >
                    {noDataConfig?.action.elasticAgent.title}
                  </EuiButton>
                  <EuiSpacer size="m" />
                  <EuiText size="s">
                    <p>
                      <TechnicalPreviewBadge style={{ verticalAlign: 'middle' }} />
                      {'  '}
                      <EuiLink
                        data-test-subj="apmCustomNoDataTemplateTryLogsLink"
                        onClick={handleEnablement}
                      >
                        {i18n.translate('xpack.apm.customEmtpyState.card.link', {
                          defaultMessage: 'Try creating services from logs',
                        })}
                      </EuiLink>
                    </p>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            }
            image={
              <EuiImage
                size="fullWidth"
                style={{
                  width: 'max(100%, 360px)',
                  height: 240,
                  objectFit: 'cover',
                  background: 'aliceblue',
                }}
                url={imageUrl}
                alt=""
              />
            }
          />
        </EuiPageTemplate.Section>
      </EuiPageTemplate>
    </ObservabilityPageTemplate>
  );
}
