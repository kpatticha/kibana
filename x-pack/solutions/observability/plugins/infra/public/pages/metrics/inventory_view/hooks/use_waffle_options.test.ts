/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { renderHook, act } from '@testing-library/react';
import type { WaffleOptionsState } from './use_waffle_options';
import { useWaffleOptions, mapInventoryViewToState } from './use_waffle_options';
import { useUrlState } from '@kbn/observability-shared-plugin/public';
import { useAlertPrefillContext } from '../../../../alerting/use_alert_prefill';
import { staticInventoryViewId } from '../../../../../common/inventory_views';
import type { InventoryView } from '../../../../../common/inventory_views/types';

jest.mock('@kbn/observability-shared-plugin/public');
jest.mock('../../../../alerting/use_alert_prefill');

const mockUseUrlState = useUrlState as jest.MockedFunction<typeof useUrlState>;
const mockUseAlertPrefillContext = useAlertPrefillContext as jest.MockedFunction<
  typeof useAlertPrefillContext
>;

// Mock useUrlState hook
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: '',
    replace: () => {},
  }),
}));

jest.mock('./use_inventory_views', () => ({
  useInventoryViewsContext: () => ({
    currentView: undefined,
  }),
}));

const renderUseWaffleOptionsHook = () => renderHook(() => useWaffleOptions());

const setPrefillState = jest.fn((args: Partial<WaffleOptionsState>) => args);

describe('useWaffleOptions', () => {
  beforeEach(() => {
    mockUseAlertPrefillContext.mockReturnValue({
      inventoryPrefill: {
        setPrefillState,
      },
    } as unknown as ReturnType<typeof useAlertPrefillContext>);

    mockUseUrlState.mockReturnValue([{}, jest.fn()]);
  });

  it('should sync the options to the inventory alert preview context', () => {
    const { result, rerender } = renderUseWaffleOptionsHook();

    const newOptions = {
      nodeType: 'pod',
      metric: { type: 'memory' },
      customMetrics: [
        {
          type: 'custom',
          id: "i don't want to bother to copy and paste an actual uuid so instead i'm going to smash my keyboard skjdghsjodkyjheurvjnsgn",
          aggregation: 'avg',
          field: 'hey.system.are.you.good',
        },
      ],
      accountId: '123456789012',
      region: 'us-east-1',
    } as WaffleOptionsState;
    act(() => {
      mockUseUrlState.mockReturnValue([newOptions, jest.fn()]);
      result.current.changeNodeType(newOptions.nodeType);
    });

    rerender();
    expect(setPrefillState).toHaveBeenCalledWith(
      expect.objectContaining({ nodeType: newOptions.nodeType })
    );

    act(() => {
      mockUseUrlState.mockReturnValue([newOptions, jest.fn()]);
      result.current.changeMetric(newOptions.metric);
    });

    rerender();
    expect(setPrefillState).toHaveBeenCalledWith(
      expect.objectContaining({ metric: newOptions.metric })
    );

    act(() => {
      mockUseUrlState.mockReturnValue([newOptions, jest.fn()]);
      result.current.changeCustomMetrics(newOptions.customMetrics);
    });

    rerender();
    expect(setPrefillState).toHaveBeenCalledWith(
      expect.objectContaining({ customMetrics: newOptions.customMetrics })
    );

    act(() => {
      mockUseUrlState.mockReturnValue([newOptions, jest.fn()]);
      result.current.changeAccount(newOptions.accountId);
    });

    rerender();
    expect(setPrefillState).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: newOptions.accountId })
    );

    act(() => {
      mockUseUrlState.mockReturnValue([newOptions, jest.fn()]);
      result.current.changeRegion(newOptions.region);
    });

    rerender();
    expect(setPrefillState).toHaveBeenCalledWith(
      expect.objectContaining({ region: newOptions.region })
    );
  });
});

describe('mapInventoryViewToState preferredSchema', () => {
  const buildView = (overrides: Record<string, unknown>): InventoryView =>
    ({
      id: staticInventoryViewId,
      attributes: {
        metric: { type: 'cpu' },
        groupBy: [],
        nodeType: 'pod',
        view: 'map',
        customOptions: [],
        autoBounds: true,
        boundsOverride: { max: 1, min: 0 },
        accountId: '',
        region: '',
        customMetrics: [],
        legend: undefined,
        sort: { by: 'name', direction: 'desc' },
        timelineOpen: false,
        ...overrides,
      },
    } as unknown as InventoryView);

  it('resets preferredSchema to null for the static view on pod', () => {
    const state = mapInventoryViewToState(buildView({ nodeType: 'pod' }));
    expect(state.preferredSchema).toBeNull();
  });

  it('resets preferredSchema to null for the static view on host', () => {
    const state = mapInventoryViewToState(buildView({ nodeType: 'host' }));
    expect(state.preferredSchema).toBeNull();
  });

  it('keeps the saved preferredSchema for non-static saved views', () => {
    const view = buildView({ nodeType: 'pod', preferredSchema: 'semconv' });
    const state = mapInventoryViewToState({ ...view, id: 'my-saved-view' } as InventoryView);
    expect(state.preferredSchema).toBe('semconv');
  });
});
