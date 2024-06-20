/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { LogsRatesMetrics } from '@kbn/logs-data-access-plugin/server';
import { AgentName } from '../../../typings/es_schemas/ui/fields/agent';

export interface EntityMetrics extends TraceMetrics, LogsRatesMetrics {}

export interface EntityMetrics {
  latency: number;
  throughput: number;
  failedTransactionRate: number;
  logRatePerMinute: number;
  logErrorRate: number | null;
}

export interface Entity {
  id: string;
  latestTimestamp: string;
  identityFields: {
    service: {
      name: string;
      environment?: string | null;
    };
  };
  metrics: EntityMetrics;
}

export interface TraceMetrics {
  latency: number | null;
  throughput: number | null;
  failedTransactionRate: number | null;
}

export interface ServiceEntities {
  serviceName: string;
  agentName: AgentName;
  signalTypes: string[];
  entity: Entity;
}

export interface EntitiesRaw {
  agent: {
    name: AgentName[];
  };
  data_stream: {
    type: string[];
  };
  entity: Entity;
}

export interface MergedServiceEntities {
  serviceName: string;
  agentName: AgentName;
  signalTypes: SignalTypes[];
  environments: string[];
  metrics: EntityMetrics[];
}
