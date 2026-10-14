/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from '@kbn/shared-ux-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { __IntlProvider as IntlProvider } from '@kbn/i18n-react';
import { coreMock } from '@kbn/core/public/mocks';
import { SwitchSuccessCallout } from './switch_success_callout';

const renderCallout = (initialPath: string) => {
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const { application } = coreMock.createStart();

  render(
    <IntlProvider locale="en">
      <Router history={history}>
        <SwitchSuccessCallout application={application} />
      </Router>
    </IntlProvider>
  );

  return { history, application };
};

const CALLOUT = 'infrastructureEntitiesSwitchSuccessCallout';

describe('SwitchSuccessCallout', () => {
  it('does not render without the switched param', () => {
    renderCallout('/');

    expect(screen.queryByTestId(CALLOUT)).not.toBeInTheDocument();
  });

  it('renders and strips the switched param so it does not survive a reload', () => {
    const { history } = renderCallout('/?switched=true&foo=bar');

    expect(screen.getByTestId(CALLOUT)).toBeInTheDocument();
    expect(history.location.search).toBe('?foo=bar');
  });

  it('navigates to Advanced Settings when reverting', async () => {
    const { application } = renderCallout('/?switched=true');

    await userEvent.click(screen.getByTestId('infrastructureEntitiesSwitchSuccessRevertLink'));

    expect(application.navigateToApp).toHaveBeenCalledWith('management', {
      path: 'kibana/settings?query=Infrastructure%20entities',
    });
  });

  it('hides on dismiss', async () => {
    renderCallout('/?switched=true');

    await userEvent.click(screen.getByTestId('infrastructureEntitiesSwitchSuccessDismissLink'));

    expect(screen.queryByTestId(CALLOUT)).not.toBeInTheDocument();
  });
});
