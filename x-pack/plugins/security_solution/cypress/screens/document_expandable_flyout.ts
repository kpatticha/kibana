/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  ANALYZER_GRAPH_TEST_ID,
  SESSION_VIEW_TEST_ID,
  ENTITIES_DETAILS_TEST_ID,
  THREAT_INTELLIGENCE_DETAILS_TEST_ID,
  PREVALENCE_DETAILS_TEST_ID,
  CORRELATIONS_DETAILS_TEST_ID,
} from '../../public/flyout/left/components/test_ids';
import {
  HISTORY_TAB_CONTENT_TEST_ID,
  INVESTIGATIONS_TAB_CONTENT_TEST_ID,
  INSIGHTS_TAB_BUTTON_GROUP_TEST_ID,
  INSIGHTS_TAB_ENTITIES_BUTTON_TEST_ID,
  INSIGHTS_TAB_THREAT_INTELLIGENCE_BUTTON_TEST_ID,
  INSIGHTS_TAB_PREVALENCE_BUTTON_TEST_ID,
  INSIGHTS_TAB_CORRELATIONS_BUTTON_TEST_ID,
  VISUALIZE_TAB_BUTTON_GROUP_TEST_ID,
  VISUALIZE_TAB_GRAPH_ANALYZER_BUTTON_TEST_ID,
  VISUALIZE_TAB_SESSION_VIEW_BUTTON_TEST_ID,
} from '../../public/flyout/left/tabs/test_ids';
import {
  HISTORY_TAB_TEST_ID,
  INSIGHTS_TAB_TEST_ID,
  INVESTIGATIONS_TAB_TEST_ID,
  VISUALIZE_TAB_TEST_ID,
} from '../../public/flyout/left/test_ids';
import {
  FLYOUT_BODY_TEST_ID,
  JSON_TAB_TEST_ID,
  OVERVIEW_TAB_TEST_ID,
  TABLE_TAB_TEST_ID,
} from '../../public/flyout/right/test_ids';
import {
  JSON_TAB_CONTENT_TEST_ID,
  TABLE_TAB_CONTENT_TEST_ID,
} from '../../public/flyout/right/tabs/test_ids';
import {
  COLLAPSE_DETAILS_BUTTON_TEST_ID,
  DESCRIPTION_DETAILS_TEST_ID,
  DESCRIPTION_EXPAND_BUTTON_TEST_ID,
  DESCRIPTION_SECTION_CONTENT_TEST_ID,
  DESCRIPTION_SECTION_HEADER_TEST_ID,
  DESCRIPTION_TITLE_TEST_ID,
  EXPAND_DETAILS_BUTTON_TEST_ID,
  FLYOUT_HEADER_RISK_SCORE_TITLE_TEST_ID,
  FLYOUT_HEADER_RISK_SCORE_VALUE_TEST_ID,
  FLYOUT_HEADER_SEVERITY_TITLE_TEST_ID,
  FLYOUT_HEADER_SEVERITY_VALUE_TEST_ID,
  FLYOUT_HEADER_TITLE_TEST_ID,
  HIGHLIGHTED_FIELDS_DETAILS_TEST_ID,
  HIGHLIGHTED_FIELDS_GO_TO_TABLE_LINK,
  HIGHLIGHTED_FIELDS_HEADER_EXPAND_ICON_TEST_ID,
  HIGHLIGHTED_FIELDS_TEST_ID,
  HIGHLIGHTED_FIELDS_TITLE_TEST_ID,
  INVESTIGATION_SECTION_CONTENT_TEST_ID,
  INVESTIGATION_SECTION_HEADER_TEST_ID,
  MITRE_ATTACK_DETAILS_TEST_ID,
  MITRE_ATTACK_TITLE_TEST_ID,
  REASON_DETAILS_TEST_ID,
  REASON_TITLE_TEST_ID,
  INSIGHTS_HEADER_TEST_ID,
  ENTITIES_HEADER_TEST_ID,
  ENTITIES_CONTENT_TEST_ID,
  ENTITY_PANEL_HEADER_TEST_ID,
  ENTITY_PANEL_CONTENT_TEST_ID,
  ENTITIES_VIEW_ALL_BUTTON_TEST_ID,
} from '../../public/flyout/right/components/test_ids';
import {
  getClassSelector,
  getDataTestSubjectSelector,
  getDataTestSubjectSelectorStartWith,
} from '../helpers/common';

/* Kibana */

export const KIBANA_NAVBAR_ALERTS_PAGE = getDataTestSubjectSelector(
  'solutionSideNavItemLink-alerts'
);
export const KIBANA_NAVBAR_CASES_PAGE = getDataTestSubjectSelector('solutionSideNavItemLink-cases');
export const KIBANA_TOAST = getDataTestSubjectSelector('globalToastList');

/* Right section */

export const DOCUMENT_DETAILS_FLYOUT_BODY = getDataTestSubjectSelector(FLYOUT_BODY_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_HEADER_TITLE = getDataTestSubjectSelector(
  FLYOUT_HEADER_TITLE_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_EXPAND_DETAILS_BUTTON = getDataTestSubjectSelector(
  EXPAND_DETAILS_BUTTON_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_COLLAPSE_DETAILS_BUTTON = getDataTestSubjectSelector(
  COLLAPSE_DETAILS_BUTTON_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB =
  getDataTestSubjectSelector(OVERVIEW_TAB_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB = getDataTestSubjectSelector(TABLE_TAB_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_JSON_TAB = getDataTestSubjectSelector(JSON_TAB_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_CONTENT =
  getDataTestSubjectSelector(TABLE_TAB_CONTENT_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_JSON_TAB_CONTENT =
  getDataTestSubjectSelector(JSON_TAB_CONTENT_TEST_ID);

/* Left section */

export const DOCUMENT_DETAILS_FLYOUT_VISUALIZE_TAB =
  getDataTestSubjectSelector(VISUALIZE_TAB_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB =
  getDataTestSubjectSelector(INSIGHTS_TAB_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_INVESTIGATIONS_TAB = getDataTestSubjectSelector(
  INVESTIGATIONS_TAB_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_HISTORY_TAB = getDataTestSubjectSelector(HISTORY_TAB_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_INVESTIGATIONS_TAB_CONTENT = getDataTestSubjectSelector(
  INVESTIGATIONS_TAB_CONTENT_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_HISTORY_TAB_CONTENT = getDataTestSubjectSelector(
  HISTORY_TAB_CONTENT_TEST_ID
);

/* Left Section - Visualize tab */
export const DOCUMENT_DETAILS_FLYOUT_VISUALIZE_TAB_BUTTON_GROUP = getDataTestSubjectSelector(
  VISUALIZE_TAB_BUTTON_GROUP_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_VISUALIZE_TAB_SESSION_VIEW_BUTTON = getDataTestSubjectSelector(
  VISUALIZE_TAB_SESSION_VIEW_BUTTON_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_VISUALIZE_TAB_SESSION_VIEW_CONTENT =
  getDataTestSubjectSelector(SESSION_VIEW_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_VISUALIZE_TAB_GRAPH_ANALYZER_BUTTON =
  getDataTestSubjectSelector(VISUALIZE_TAB_GRAPH_ANALYZER_BUTTON_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_VISUALIZE_TAB_GRAPH_ANALYZER_CONTENT =
  getDataTestSubjectSelector(ANALYZER_GRAPH_TEST_ID);

/* Left Section - Insights tab */
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_BUTTON_GROUP = getDataTestSubjectSelector(
  INSIGHTS_TAB_BUTTON_GROUP_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_ENTITIES_BUTTON = getDataTestSubjectSelector(
  INSIGHTS_TAB_ENTITIES_BUTTON_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_ENTITIES_CONTENT =
  getDataTestSubjectSelector(ENTITIES_DETAILS_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_THREAT_INTELLIGENCE_BUTTON =
  getDataTestSubjectSelector(INSIGHTS_TAB_THREAT_INTELLIGENCE_BUTTON_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_THREAT_INTELLIGENCE_CONTENT =
  getDataTestSubjectSelector(THREAT_INTELLIGENCE_DETAILS_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_PREVALENCE_BUTTON = getDataTestSubjectSelector(
  INSIGHTS_TAB_PREVALENCE_BUTTON_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_PREVALENCE_CONTENT = getDataTestSubjectSelector(
  PREVALENCE_DETAILS_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_CORRELATIONS_BUTTON = getDataTestSubjectSelector(
  INSIGHTS_TAB_CORRELATIONS_BUTTON_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_INSIGHTS_TAB_CORRELATIONS_CONTENT = getDataTestSubjectSelector(
  CORRELATIONS_DETAILS_TEST_ID
);

/* Footer */

export const DOCUMENT_DETAILS_FLYOUT_FOOTER = getDataTestSubjectSelector(
  'side-panel-flyout-footer'
);
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_TAKE_ACTION_BUTTON = getDataTestSubjectSelector(
  'take-action-dropdown-btn'
);
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_TAKE_ACTION_BUTTON_DROPDOWN =
  getDataTestSubjectSelector('takeActionPanelMenu');

export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_TO_EXISTING_CASE = getDataTestSubjectSelector(
  'add-to-existing-case-action'
);
export const CREATE_CASE_BUTTON = `[data-test-subj="createNewCaseBtn"]`;
export const NEW_CASE_NAME_INPUT = `[data-test-subj="input"][aria-describedby="caseTitle"]`;

export const NEW_CASE_DESCRIPTION_INPUT = getDataTestSubjectSelector('euiMarkdownEditorTextArea');

export const NEW_CASE_CREATE_BUTTON = getDataTestSubjectSelector('create-case-submit');
export const EXISTING_CASE_SELECT_BUTTON =
  getDataTestSubjectSelectorStartWith('cases-table-row-select-');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_TO_NEW_CASE =
  getDataTestSubjectSelector('add-to-new-case-action');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_TO_NEW_CASE_NAME_INPUT = NEW_CASE_NAME_INPUT;
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_TO_NEW_CASE_DESCRIPTION_INPUT =
  NEW_CASE_DESCRIPTION_INPUT;

export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_TO_NEW_CASE_CREATE_BUTTON = NEW_CASE_CREATE_BUTTON;

export const VIEW_CASE_TOASTER_LINK = getDataTestSubjectSelector('toaster-content-case-view-link');
export const CASE_ACTION_WRAPPER = getDataTestSubjectSelector('case-action-bar-wrapper');

export const CASE_ELLIPSE_BUTTON = getDataTestSubjectSelector('property-actions-case-ellipses');

export const CASE_ELLIPSE_DELETE_CASE_OPTION = getDataTestSubjectSelector(
  'property-actions-case-trash'
);

export const CASE_ELLIPSE_DELETE_CASE_CONFIRMATION_BUTTON = getDataTestSubjectSelector(
  'confirmModalConfirmButton'
);

export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_MARK_AS_ACKNOWLEDGED = getDataTestSubjectSelector(
  'acknowledged-alert-status'
);
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_MARK_AS_CLOSED =
  getDataTestSubjectSelector('close-alert-status');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_ENDPOINT_EXCEPTION = getDataTestSubjectSelector(
  'add-endpoint-exception-menu-item'
);
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_RULE_EXCEPTION =
  getDataTestSubjectSelector('add-exception-menu-item');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_RULE_EXCEPTION_FLYOUT_HEADER =
  getDataTestSubjectSelector('exceptionFlyoutTitle');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_ADD_RULE_EXCEPTION_FLYOUT_CANCEL_BUTTON =
  getDataTestSubjectSelector('cancelExceptionAddButton');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_RESPOND = getDataTestSubjectSelector(
  'endpointResponseActions-action-item'
);
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_INVESTIGATE_IN_TIMELINE = getDataTestSubjectSelector(
  'investigate-in-timeline-action-item'
);
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_INVESTIGATE_IN_TIMELINE_SECTION =
  getDataTestSubjectSelector('timelineHeader');
export const DOCUMENT_DETAILS_FLYOUT_FOOTER_INVESTIGATE_IN_TIMELINE_ENTRY =
  getDataTestSubjectSelector('providerContainer');

/* Overview tab */

export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_DESCRIPTION_SECTION_HEADER =
  getDataTestSubjectSelector(DESCRIPTION_SECTION_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_DESCRIPTION_SECTION_CONTENT =
  getDataTestSubjectSelector(DESCRIPTION_SECTION_CONTENT_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_DESCRIPTION_TITLE =
  getDataTestSubjectSelector(DESCRIPTION_TITLE_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_DESCRIPTION_DETAILS = getDataTestSubjectSelector(
  DESCRIPTION_DETAILS_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_DESCRIPTION_EXPAND_BUTTON =
  getDataTestSubjectSelector(DESCRIPTION_EXPAND_BUTTON_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_REASON_TITLE =
  getDataTestSubjectSelector(REASON_TITLE_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_REASON_DETAILS =
  getDataTestSubjectSelector(REASON_DETAILS_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_MITRE_ATTACK_TITLE = getDataTestSubjectSelector(
  MITRE_ATTACK_TITLE_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_MITRE_ATTACK_DETAILS = getDataTestSubjectSelector(
  MITRE_ATTACK_DETAILS_TEST_ID
);
export const DOCUMENT_DETAILS_OVERVIEW_TAB_HEADER_TITLE = getDataTestSubjectSelector(
  FLYOUT_HEADER_TITLE_TEST_ID
);
export const DOCUMENT_DETAILS_OVERVIEW_TAB_HEADER_RISK_SCORE = getDataTestSubjectSelector(
  FLYOUT_HEADER_RISK_SCORE_TITLE_TEST_ID
);
export const DOCUMENT_DETAILS_OVERVIEW_TAB_HEADER_RISK_SCORE_VALUE = getDataTestSubjectSelector(
  FLYOUT_HEADER_RISK_SCORE_VALUE_TEST_ID
);
export const DOCUMENT_DETAILS_OVERVIEW_TAB_HEADER_SEVERITY = getDataTestSubjectSelector(
  FLYOUT_HEADER_SEVERITY_TITLE_TEST_ID
);
export const DOCUMENT_DETAILS_OVERVIEW_TAB_HEADER_SEVERITY_VALUE = getDataTestSubjectSelector(
  FLYOUT_HEADER_SEVERITY_VALUE_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_HIGHLIGHTED_FIELDS = getDataTestSubjectSelector(
  HIGHLIGHTED_FIELDS_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_HIGHLIGHTED_FIELDS_HEADER_EXPAND_ICON =
  getDataTestSubjectSelector(HIGHLIGHTED_FIELDS_HEADER_EXPAND_ICON_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INVESTIGATION_SECTION_HEADER =
  getDataTestSubjectSelector(INVESTIGATION_SECTION_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INVESTIGATION_SECTION_CONTENT =
  getDataTestSubjectSelector(INVESTIGATION_SECTION_CONTENT_TEST_ID);

export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_HIGHLIGHTED_FIELDS_HEADER_TITLE =
  getDataTestSubjectSelector(HIGHLIGHTED_FIELDS_TITLE_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_HIGHLIGHTED_FIELDS_DETAILS =
  getDataTestSubjectSelector(HIGHLIGHTED_FIELDS_DETAILS_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_HIGHLIGHTED_FIELDS_GO_TO_TABLE_LINK =
  getDataTestSubjectSelector(HIGHLIGHTED_FIELDS_GO_TO_TABLE_LINK);

export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INSIGHTS_SECTION_HEADER =
  getDataTestSubjectSelector(INSIGHTS_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INSIGHTS_ENTITIES_HEADER =
  getDataTestSubjectSelector(ENTITIES_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INSIGHTS_ENTITIES_CONTENT =
  getDataTestSubjectSelector(ENTITIES_CONTENT_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INSIGHTS_VIEW_ALL_ENTITIES_BUTTON =
  getDataTestSubjectSelector(ENTITIES_VIEW_ALL_BUTTON_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INSIGHTS_ENTITY_PANEL_HEADER =
  getDataTestSubjectSelector(ENTITY_PANEL_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_OVERVIEW_TAB_INSIGHTS_ENTITY_PANEL_CONTENT =
  getDataTestSubjectSelector(ENTITY_PANEL_CONTENT_TEST_ID);

/* Table tab */

export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_FILTER = getClassSelector('euiFieldSearch');
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_CLEAR_FILTER =
  getDataTestSubjectSelector('clearSearchButton');
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_TIMESTAMP_ROW = getDataTestSubjectSelector(
  'event-fields-table-row-@timestamp'
);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_ID_ROW = getDataTestSubjectSelector(
  'event-fields-table-row-_id'
);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_EVENT_TYPE_ROW = getDataTestSubjectSelector(
  'event-fields-table-row-event.type'
);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_ROW_CELL_FILTER_IN = getDataTestSubjectSelector(
  'actionItem-security-detailsFlyout-cellActions-filterIn'
);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_ROW_CELL_FILTER_OUT = getDataTestSubjectSelector(
  'actionItem-security-detailsFlyout-cellActions-filterOut'
);
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_ROW_CELL_MORE_ACTIONS =
  getDataTestSubjectSelector('showExtraActionsButton');
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_ROW_CELL_ADD_TO_TIMELINE =
  getDataTestSubjectSelector('actionItem-security-detailsFlyout-cellActions-addToTimeline');
export const DOCUMENT_DETAILS_FLYOUT_TABLE_TAB_ROW_CELL_COPY_TO_CLIPBOARD =
  getDataTestSubjectSelector('actionItem-security-detailsFlyout-cellActions-copyToClipboard');
