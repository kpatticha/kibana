/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { EuiButtonEmpty, EuiConfirmModal } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React, { useCallback, useState } from 'react';
import { MergedServiceDashboard } from '..';
import { useApmPluginContext } from '../../../../context/apm_plugin/use_apm_plugin_context';
import { callApmApi } from '../../../../services/rest/create_call_apm_api';

export function UnlinkDashboard({
  currentDashboard,
  onRefresh,
}: {
  currentDashboard: MergedServiceDashboard;
  onRefresh: () => void;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    core: { notifications },
  } = useApmPluginContext();

  const onConfirm = useCallback(
    async function () {
      try {
        await callApmApi('DELETE /internal/apm/service-dashboard', {
          params: { query: { serviceDashboardId: currentDashboard.id } },
          signal: null,
        });

        notifications.toasts.addSuccess({
          title: i18n.translate(
            'xpack.apm.serviceDashboards.unlinkSuccess.toast.title',
            {
              defaultMessage: 'Unlinked "{dashboardName}" dashboard',
              values: { dashboardName: currentDashboard?.title },
            }
          ),
        });
        onRefresh();
      } catch (error) {
        console.error(error);
        notifications.toasts.addDanger({
          title: i18n.translate(
            'xpack.apm.serviceDashboards.unlinkFailure.toast.title',
            {
              defaultMessage:
                'Error while unlinking "{dashboardName}" dashboard',
              values: { dashboardName: currentDashboard?.title },
            }
          ),
          text: error.body.message,
        });
      }
      setIsModalVisible(!isModalVisible);
    },
    [
      currentDashboard,
      notifications.toasts,
      setIsModalVisible,
      onRefresh,
      isModalVisible,
    ]
  );
  return (
    <>
      <EuiButtonEmpty
        color="danger"
        size="s"
        iconType={'unlink'}
        data-test-subj="apmUnLinkServiceDashboardMenu"
        onClick={() => setIsModalVisible(true)}
      >
        {i18n.translate('xpack.apm.serviceDashboards.unlinkEmptyButtonLabel', {
          defaultMessage: 'Unlink dashboard',
        })}
      </EuiButtonEmpty>
      {isModalVisible && (
        <EuiConfirmModal
          title={i18n.translate(
            'xpack.apm.serviceDashboards.unlinkEmptyButtonLabel.confirm.title',
            {
              defaultMessage: 'Unlink Dashboard',
            }
          )}
          onCancel={() => setIsModalVisible(false)}
          onConfirm={onConfirm}
          confirmButtonText={i18n.translate(
            'xpack.apm.serviceDashboards.unlinkEmptyButtonLabel.confirm.button',
            {
              defaultMessage: 'Unlink dashboard',
            }
          )}
          buttonColor="danger"
          defaultFocusedButton="confirm"
        >
          <p>
            {i18n.translate(
              'xpack.apm.serviceDashboards.unlinkEmptyButtonLabel.confirm.body',
              {
                defaultMessage:
                  'You are about to unlink the dashboard from the service context',
              }
            )}
          </p>
        </EuiConfirmModal>
      )}
    </>
  );
}
