/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';

interface Benefit {
  id: string;
  icon: string;
  headline: string;
  body: string;
}

const benefits: Benefit[] = [
  {
    id: 'speed',
    icon: 'bolt',
    headline: i18n.translate('xpack.infra.infrastructureEntitiesPromo.speedHeadline', {
      defaultMessage: "It's fast, even at scale.",
    }),
    body: i18n.translate('xpack.infra.infrastructureEntitiesPromo.speedBody', {
      defaultMessage:
        'We rebuilt this from the ground up. Thousands of hosts, pods, and clusters load instantly.',
    }),
  },
  {
    id: 'views',
    icon: 'eye',
    headline: i18n.translate('xpack.infra.infrastructureEntitiesPromo.viewsHeadline', {
      defaultMessage: 'See your system two ways.',
    }),
    body: i18n.translate('xpack.infra.infrastructureEntitiesPromo.viewsBody', {
      defaultMessage:
        'A hexagon health map when you need the big picture. A list when you need to find something specific. Toggle between them anytime.',
    }),
  },
  {
    id: 'context',
    icon: 'layers',
    headline: i18n.translate('xpack.infra.infrastructureEntitiesPromo.contextHeadline', {
      defaultMessage: 'More context, fewer clicks.',
    }),
    body: i18n.translate('xpack.infra.infrastructureEntitiesPromo.contextBody', {
      defaultMessage:
        'The new flyout brings health signals, alerts, dashboards, logs together — without taking you anywhere else.',
    }),
  },
];

interface Props {
  isSwitching: boolean;
  onClose: () => void;
  onDismissForever: () => void;
  onSwitch: () => void;
}

export const InfrastructureEntitiesSwitchModal = ({
  isSwitching,
  onClose,
  onDismissForever,
  onSwitch,
}: Props) => {
  const titleId = useGeneratedHtmlId({ prefix: 'infraEntitiesPromoTitle' });

  return (
    <EuiModal
      aria-labelledby={titleId}
      onClose={onClose}
      maxWidth={640}
      data-test-subj="infraInfrastructureEntitiesPromoModal"
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id={titleId}>
          <FormattedMessage
            id="xpack.infra.infrastructureEntitiesPromo.title"
            defaultMessage="Switch to the new infrastructure experience"
          />
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        <EuiTitle size="xxs">
          <h3>
            <FormattedMessage
              id="xpack.infra.infrastructureEntitiesPromo.whySwitch"
              defaultMessage="Why switch?"
            />
          </h3>
        </EuiTitle>
        <EuiSpacer size="m" />

        <EuiFlexGroup direction="column" gutterSize="m">
          {benefits.map(({ id, icon, headline, body }) => (
            <EuiFlexItem key={id}>
              <EuiFlexGroup gutterSize="m" alignItems="flexStart" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiIcon type={icon} color="primary" aria-hidden={true} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size="s">
                    <strong>{headline}</strong> {body}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>

        <EuiHorizontalRule margin="l" />

        <EuiText size="s" color="subdued">
          <FormattedMessage
            id="xpack.infra.infrastructureEntitiesPromo.note"
            defaultMessage="{note} switching enables the new experience for all users in this space. You can switch back anytime from {advancedSettings}. This is still being shaped, so your feedback counts."
            values={{
              note: (
                <strong>
                  <FormattedMessage
                    id="xpack.infra.infrastructureEntitiesPromo.noteLabel"
                    defaultMessage="Note:"
                  />
                </strong>
              ),
              advancedSettings: (
                <strong>
                  <FormattedMessage
                    id="xpack.infra.infrastructureEntitiesPromo.advancedSettingsPath"
                    defaultMessage="Advanced Settings > Observability"
                  />
                </strong>
              ),
            }}
          />
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty
          onClick={onDismissForever}
          isDisabled={isSwitching}
          data-test-subj="infraInfrastructureEntitiesPromoDismissButton"
        >
          <FormattedMessage
            id="xpack.infra.infrastructureEntitiesPromo.dismissForever"
            defaultMessage="Don't show this again"
          />
        </EuiButtonEmpty>
        <EuiButton
          fill
          iconType="merge"
          onClick={onSwitch}
          isLoading={isSwitching}
          data-test-subj="infraInfrastructureEntitiesPromoSwitchButton"
        >
          <FormattedMessage
            id="xpack.infra.infrastructureEntitiesPromo.switch"
            defaultMessage="Switch"
          />
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
