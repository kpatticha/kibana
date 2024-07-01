/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import useToggle from 'react-use/lib/useToggle';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLoadingSpinner,
  EuiPopover,
  EuiPopoverFooter,
  EuiText,
  EuiTextColor,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { TechnicalPreviewBadge } from '../technical_preview_badge';
import { ApmPluginStartDeps } from '../../../plugin';
import { useEntityManager } from '../../../hooks/use_entity_manager';

export function EntityEnablement() {
  const {
    services: { entityManager },
  } = useKibana<ApmPluginStartDeps>();

  const [isEntityDiscoveryEnabled] = useEntityManager();
  const [isPopoverOpen, togglePopover] = useToggle(false);
  const [isLoading, setIsLoading] = useToggle(false);

  const handleRestoreView = async () => {
    setIsLoading(true);
    try {
      const response = await entityManager.entityClient.disableManagedEntityDiscovery();
      console.log('response---', response);
      if (response.success) {
        setIsLoading(false);
        window.location.reload();
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const handleEnableblement = async () => {
    setIsLoading(true);
    try {
      const response = await entityManager.entityClient.enableManagedEntityDiscovery();
      if (response.success) {
        setIsLoading(false);
        window.location.reload();
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };
  return (
    <EuiFlexGroup direction="row" alignItems="center" gutterSize="xs">
      <EuiFlexItem grow={false}>
        {isLoading ? <EuiLoadingSpinner size="m" /> : <TechnicalPreviewBadge icon="beaker" />}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiLink
          disabled={isEntityDiscoveryEnabled}
          data-test-subj="tryOutEEMLink"
          onClick={handleEnableblement}
        >
          {isEntityDiscoveryEnabled
            ? i18n.translate('xpack.apm.eemEnablement.enabled.', {
                defaultMessage: 'This is Elastic’s new experience!',
              })
            : i18n.translate('xpack.apm.eemEnablement.tryItButton.', {
                defaultMessage: 'Try out Elastic’s new experience!',
              })}
        </EuiLink>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiPopover
          button={
            <EuiButtonIcon
              disabled={isEntityDiscoveryEnabled}
              onClick={togglePopover}
              data-test-subj="apmEntityEnablementWithFooterButton"
              iconType="iInCircle"
              size="xs"
              aria-label={i18n.translate('xpack.apm.entityEnablement.euiButtonIcon.arial', {
                defaultMessage: 'click to find more for the new ui experience',
              })}
            />
          }
          isOpen={isPopoverOpen}
          closePopover={togglePopover}
          anchorPosition="upCenter"
        >
          <div>
            <EuiText size="s">
              <p>
                {i18n.translate('xpack.apm.entityEnablement.content', {
                  defaultMessage: '[TBD]',
                })}
              </p>
            </EuiText>
          </div>
          <EuiPopoverFooter>
            <EuiTextColor color="subdued">
              {i18n.translate('xpack.apm.entityEnablement.footer', {
                defaultMessage: '[TBD] See documentation',
              })}
            </EuiTextColor>
          </EuiPopoverFooter>
        </EuiPopover>
      </EuiFlexItem>
      {isEntityDiscoveryEnabled && (
        <EuiFlexItem grow={false}>
          <EuiLink data-test-subj="restoreClassiView" onClick={handleRestoreView}>
            {i18n.translate('xpack.apm.eemEnablement.restoveClassicView.', {
              defaultMessage: 'Restore classic view',
            })}
          </EuiLink>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
}
