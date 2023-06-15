/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { PerformRuleUpgradeResponseBody } from '../../../../../../common/detection_engine/prebuilt_rules/api/perform_rule_upgrade/perform_rule_upgrade_response_schema';
import { PERFORM_RULE_UPGRADE_URL } from '../../../../../../common/detection_engine/prebuilt_rules/api/urls';
import { useInvalidateFindRulesQuery } from '../use_find_rules_query';
import { useInvalidateFetchRuleManagementFiltersQuery } from '../use_fetch_rule_management_filters_query';
import { useInvalidateFetchRulesSnoozeSettingsQuery } from '../use_fetch_rules_snooze_settings';
import { useInvalidateFetchPrebuiltRulesUpgradeReviewQuery } from './use_fetch_prebuilt_rules_upgrade_review_query';
import { useInvalidateFetchPrebuiltRulesStatusQuery } from './use_fetch_prebuilt_rules_status_query';
import { performUpgradeAllRules } from '../../api';

export const PERFORM_ALL_RULES_UPGRADE_KEY = ['POST', 'ALL_RULES', PERFORM_RULE_UPGRADE_URL];

export const usePerformAllRulesUpgradeMutation = (
  options?: UseMutationOptions<PerformRuleUpgradeResponseBody, Error>
) => {
  const invalidateFindRulesQuery = useInvalidateFindRulesQuery();
  const invalidateFetchRulesSnoozeSettings = useInvalidateFetchRulesSnoozeSettingsQuery();
  const invalidateFetchRuleManagementFilters = useInvalidateFetchRuleManagementFiltersQuery();
  const invalidateFetchPrebuiltRulesUpgradeReview =
    useInvalidateFetchPrebuiltRulesUpgradeReviewQuery();
  const invalidateRuleStatus = useInvalidateFetchPrebuiltRulesStatusQuery();

  return useMutation<PerformRuleUpgradeResponseBody, Error>(() => performUpgradeAllRules(), {
    ...options,
    mutationKey: PERFORM_ALL_RULES_UPGRADE_KEY,
    onSettled: (...args) => {
      invalidateFindRulesQuery();
      invalidateFetchRulesSnoozeSettings();
      invalidateFetchRuleManagementFilters();

      invalidateFetchPrebuiltRulesUpgradeReview();
      invalidateRuleStatus();

      if (options?.onSettled) {
        options.onSettled(...args);
      }
    },
  });
};
