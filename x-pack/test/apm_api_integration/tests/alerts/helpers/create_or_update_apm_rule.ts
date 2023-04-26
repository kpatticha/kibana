/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SuperTest, Test } from 'supertest';
import { ApmRuleType } from '../../../../../plugins/apm/common/rules/apm_rule_types';
import { ApmRuleParamsType } from '../../../../../plugins/apm/common/rules/schema';
import { RULE_ENDPOINT } from './constants';

export async function createApmRule<T extends ApmRuleType>({
  supertest,
  name,
  ruleTypeId,
  params,
  actions = [],
}: {
  supertest: SuperTest<Test>;
  ruleTypeId: T;
  name: string;
  params: ApmRuleParamsType[T];
  actions?: any[];
}) {
  const { body } = await supertest
    .post(`${RULE_ENDPOINT}`)
    .set('kbn-xsrf', 'foo')
    .send({
      params,
      consumer: 'apm',
      schedule: {
        interval: '1m',
      },
      tags: ['apm'],
      name,
      rule_type_id: ruleTypeId,
      actions,
    });
  return body;
}
