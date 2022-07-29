/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { DEFAULT_TABLE_ACTIVE_PAGE, DEFAULT_TABLE_LIMIT } from '../../common/store/constants';

import {
  setUsersTablesActivePageToZero,
  updateTableActivePage,
  updateTableLimit,
  updateTableSorting,
  updateUserRiskScoreSeverityFilter,
} from './actions';
import { setUsersPageQueriesActivePageToZero } from './helpers';
import type { UsersModel } from './model';
import { UsersTableType } from './model';
import { Direction } from '../../../common/search_strategy/common';
import { RiskScoreFields } from '../../../common/search_strategy';
import { UsersFields } from '../../../common/search_strategy/security_solution/users/common';

export const initialUsersState: UsersModel = {
  page: {
    queries: {
      [UsersTableType.allUsers]: {
        activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        limit: DEFAULT_TABLE_LIMIT,
        sort: {
          field: UsersFields.lastSeen,
          direction: Direction.desc,
        },
      },
      [UsersTableType.authentications]: {
        activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        limit: DEFAULT_TABLE_LIMIT,
      },
      [UsersTableType.risk]: {
        activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        limit: DEFAULT_TABLE_LIMIT,
        sort: {
          field: RiskScoreFields.riskScore,
          direction: Direction.desc,
        },
        severitySelection: [],
      },
      [UsersTableType.anomalies]: null,
      [UsersTableType.events]: {
        activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        limit: DEFAULT_TABLE_LIMIT,
      },
    },
  },
  details: {
    queries: {
      [UsersTableType.anomalies]: null,
      [UsersTableType.events]: {
        activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        limit: DEFAULT_TABLE_LIMIT,
      },
    },
  },
};

export const usersReducer = reducerWithInitialState(initialUsersState)
  .case(setUsersTablesActivePageToZero, (state) => ({
    ...state,
    page: {
      ...state.page,
      queries: setUsersPageQueriesActivePageToZero(state),
    },
  }))
  .case(updateTableActivePage, (state, { activePage, tableType }) => ({
    ...state,
    page: {
      ...state.page,
      queries: {
        ...state.page.queries,
        [tableType]: {
          ...state.page.queries[tableType],
          activePage,
        },
      },
    },
  }))
  .case(updateTableLimit, (state, { limit, tableType }) => ({
    ...state,
    page: {
      ...state.page,
      queries: {
        ...state.page.queries,
        [tableType]: {
          ...state.page.queries[tableType],
          limit,
        },
      },
    },
  }))
  .case(updateTableSorting, (state, { sort, tableType }) => ({
    ...state,
    page: {
      ...state.page,
      queries: {
        ...state.page.queries,
        [tableType]: {
          ...state.page.queries[tableType],
          sort,
          activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        },
      },
    },
  }))
  .case(updateUserRiskScoreSeverityFilter, (state, { severitySelection }) => ({
    ...state,
    page: {
      ...state.page,
      queries: {
        ...state.page.queries,
        [UsersTableType.risk]: {
          ...state.page.queries[UsersTableType.risk],
          severitySelection,
          activePage: DEFAULT_TABLE_ACTIVE_PAGE,
        },
      },
    },
  }))
  .build();
