/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { Subject } from 'rxjs';
import type { AnalyticsClientInitContext } from '@kbn/analytics-client';
import type { Event, IShipper } from '@kbn/core/public';
import { indexData } from './index_data';

export class CustomShipper implements IShipper {
  public static shipperName = 'custom-shipper';

  constructor(
    private readonly events$: Subject<Event>,
    private readonly initContext: AnalyticsClientInitContext
  ) {}

  public async reportEvents(events: Event[]) {
    this.initContext.logger.info(
      `Reporting test ${events.length} events to ${
        CustomShipper.shipperName
      }: ${JSON.stringify(events)}`
    );

    console.log('Reporting===', JSON.stringify(events));

    try {
      indexEvents(events);
    } catch (error) {
      console.error('Failed to index document:', error);
    }

    events.forEach((event) => {
      this.events$.next(event);
    });
  }
  optIn(isOptedIn: boolean) {}
  async flush() {}
  shutdown() {}
}

async function indexEvents(events) {
  for (const event of events) {
    try {
      const documentId = await indexData(event);
      console.log(`Document indexed with ID: ${documentId}`);
    } catch (error) {
      console.error('Failed to index document:', error);
    }
  }
}
