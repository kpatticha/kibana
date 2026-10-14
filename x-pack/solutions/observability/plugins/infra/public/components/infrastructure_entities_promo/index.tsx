/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { InfrastructureEntitiesSwitchModal } from './switch_modal';
import { useInfrastructureEntitiesPromo } from './use_infrastructure_entities_promo';

/** Offers the new Entities experience on the legacy Infrastructure pages. */
export const InfrastructureEntitiesPromo = () => {
  const { isVisible, isSwitching, close, dismissForever, switchToEntities } =
    useInfrastructureEntitiesPromo();

  if (!isVisible) {
    return null;
  }

  return (
    <InfrastructureEntitiesSwitchModal
      isSwitching={isSwitching}
      onClose={close}
      onDismissForever={dismissForever}
      onSwitch={switchToEntities}
    />
  );
};
