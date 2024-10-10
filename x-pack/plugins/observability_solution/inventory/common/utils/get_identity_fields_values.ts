/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ENTITY_IDENTITY_FIELDS } from '@kbn/observability-shared-plugin/common';
import { Entity } from '../entities';

export function getIdentityFieldValues({ entity }: { entity: Entity }) {
  const mapping: string[] = [];

  const identityFields = entity[ENTITY_IDENTITY_FIELDS];

  if (identityFields) {
    const fields = Array.isArray(identityFields) ? identityFields : [identityFields];

    fields.forEach((field) => {
      if (field in entity) {
        mapping.push(`${[field]}: "${entity[field as keyof Entity]}"`);
      }
    });
  }

  return mapping;
}
