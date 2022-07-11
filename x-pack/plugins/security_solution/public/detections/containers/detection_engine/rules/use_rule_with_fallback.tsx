/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { ALERT_RULE_UUID } from '@kbn/rule-data-utils';
import { useAsync, withOptionalSignal } from '@kbn/securitysolution-hook-utils';
import { isNotFoundError } from '@kbn/securitysolution-t-grid';
import { expandDottedObject } from '../../../../../common/utils/expand_dotted';

import { useAppToasts } from '../../../../common/hooks/use_app_toasts';
import type { AlertSearchResponse } from '../alerts/types';
import { useQueryAlerts } from '../alerts/use_query';
import { fetchRuleById } from './api';
import { transformInput } from './transforms';
import * as i18n from './translations';
import type { Rule } from './types';

interface UseRuleWithFallback {
  error: unknown;
  loading: boolean;
  isExistingRule: boolean;
  refresh: () => void;
  rule: Rule | null;
}

interface AlertHit {
  _id: string;
  _index: string;
  _source: {
    '@timestamp': string;
    signal?: {
      rule?: Rule;
    };
    kibana?: {
      alert?: {
        rule?: Rule;
      };
    };
  };
}

// TODO: Create proper types for nested/flattened RACRule once contract w/ Fields API is finalized.
interface RACRule {
  kibana: {
    alert: {
      rule: {
        parameters?: {};
      };
    };
  };
}

const fetchWithOptionsSignal = withOptionalSignal(fetchRuleById);

const useFetchRule = () => useAsync(fetchWithOptionsSignal);

const buildLastAlertQuery = (ruleId: string) => ({
  query: {
    bool: {
      filter: [
        {
          bool: {
            should: [
              { match: { 'signal.rule.id': ruleId } },
              { match: { [ALERT_RULE_UUID]: ruleId } },
            ],
            minimum_should_match: 1,
          },
        },
      ],
    },
  },
  size: 1,
});

/**
 * We try to fetch the rule first. If the request fails with 404, that could mean that the rule was deleted.
 * In that case, try to fetch the latest alert generated by the rule and retrieve the rule data from the alert (fallback).
 */
export const useRuleWithFallback = (ruleId: string): UseRuleWithFallback => {
  const { start, loading: ruleLoading, result: ruleData, error } = useFetchRule();
  const { addError } = useAppToasts();

  const fetch = useCallback(() => {
    start({ id: ruleId });
  }, [ruleId, start]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const isExistingRule = !isNotFoundError(error);

  const { loading: alertsLoading, data: alertsData } = useQueryAlerts<AlertHit, undefined>({
    query: buildLastAlertQuery(ruleId),
    skip: isExistingRule,
  });

  useEffect(() => {
    if (error != null && !isNotFoundError(error)) {
      addError(error, { title: i18n.RULE_AND_TIMELINE_FETCH_FAILURE });
    }
  }, [addError, error]);

  const rule = useMemo<Rule | undefined>(() => {
    const result = isExistingRule
      ? ruleData
      : alertsData == null
      ? undefined
      : transformRuleFromAlertHit(alertsData);
    if (result) {
      return transformInput(result);
    }
  }, [isExistingRule, alertsData, ruleData]);

  return {
    error,
    loading: ruleLoading || alertsLoading,
    refresh: fetch,
    rule: rule ?? null,
    isExistingRule,
  };
};

/**
 * Transforms an alertHit into a Rule
 * @param data raw response containing single alert
 */
const transformRuleFromAlertHit = (data: AlertSearchResponse<AlertHit>): Rule | undefined => {
  // if results empty, return rule as undefined
  if (data.hits.hits.length === 0) {
    return undefined;
  }
  const hit = data.hits.hits[0];

  // If pre 8.x alert, pull directly from alertHit
  const rule = hit._source.signal?.rule ?? hit._source.kibana?.alert?.rule;

  // If rule undefined, response likely flattened
  if (rule == null) {
    const expandedRuleWithParams = expandDottedObject(hit._source ?? {}) as RACRule;
    const expandedRule = {
      ...expandedRuleWithParams?.kibana?.alert?.rule,
      ...expandedRuleWithParams?.kibana?.alert?.rule?.parameters,
    };
    delete expandedRule.parameters;
    return expandedRule as Rule;
  }

  return rule;
};
