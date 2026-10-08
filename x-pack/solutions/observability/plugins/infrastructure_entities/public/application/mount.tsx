/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AppMountParameters, AppUnmount, CoreStart } from '@kbn/core/public';
import { APP_WRAPPER_CLASS } from '@kbn/core/public';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@kbn/shared-ux-router';
import { InfrastructureEntitiesApp } from './infrastructure_entities_app';

export const mountInfrastructureEntitiesApp = ({
  coreStart,
  params,
}: {
  coreStart: CoreStart;
  params: AppMountParameters;
}): AppUnmount => {
  const { element, history } = params;
  element.classList.add(APP_WRAPPER_CLASS);

  ReactDOM.render(
    coreStart.rendering.addContext(
      <Router history={history}>
        <InfrastructureEntitiesApp coreStart={coreStart} />
      </Router>
    ),
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
