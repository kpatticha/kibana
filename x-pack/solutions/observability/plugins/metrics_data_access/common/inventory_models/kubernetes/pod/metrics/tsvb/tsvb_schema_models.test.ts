/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { podCpuUsage } from './pod_cpu_usage';
import { podMemoryUsage } from './pod_memory_usage';
import { podNetworkTraffic } from './pod_network_traffic';
import { podOverview } from './pod_overview';

const args = ['@timestamp', 'metrics-*', '>=1m'] as const;

describe('pod tsvb models per schema', () => {
  it('podCpuUsage defaults to ecs fields without a schema', () => {
    const model = podCpuUsage(...args);
    const fields = model.series[0].metrics.map((m) => 'field' in m && m.field);
    expect(fields).toContain('kubernetes.pod.cpu.usage.node.pct');
    expect(fields).toContain('kubernetes.pod.cpu.usage.limit.pct');
  });

  it('podCpuUsage uses semconv fields for the semconv schema', () => {
    const model = podCpuUsage(...args, 'semconv');
    const fields = model.series[0].metrics.map((m) => 'field' in m && m.field);
    expect(fields).toContain('metrics.k8s.pod.cpu.node.utilization');
    expect(fields).toContain('metrics.k8s.pod.cpu_limit_utilization');
  });

  it('podMemoryUsage uses semconv fields for the semconv schema', () => {
    const model = podMemoryUsage(...args, 'semconv');
    const fields = model.series[0].metrics.map((m) => 'field' in m && m.field);
    expect(fields).toContain('metrics.k8s.pod.memory.node.utilization');
    expect(fields).toContain('metrics.k8s.pod.memory_limit_utilization');
  });

  it('podNetworkTraffic semconv series filter by direction and sum interfaces', () => {
    const model = podNetworkTraffic(...args, 'semconv');
    const tx = model.series.find((s) => s.id === 'tx');
    const rx = model.series.find((s) => s.id === 'rx');

    expect(tx?.filter).toEqual({ language: 'kuery', query: 'direction : "transmit"' });
    expect(tx?.split_mode).toBe('terms');
    expect(tx?.terms_field).toBe('interface');
    expect(tx?.metrics.some((m) => m.type === 'series_agg')).toBe(true);
    expect(tx?.metrics.some((m) => 'field' in m && m.field === 'metrics.k8s.pod.network.io')).toBe(
      true
    );

    expect(rx?.filter).toEqual({ language: 'kuery', query: 'direction : "receive"' });
    // rx keeps its inverting calculation so the chart renders inbound below the axis
    expect(rx?.metrics[rx.metrics.length - 1].type).toBe('series_agg');
  });

  it('podNetworkTraffic keeps the ecs cumulative-counter series without a schema', () => {
    const model = podNetworkTraffic(...args);
    const tx = model.series.find((s) => s.id === 'tx');
    expect(tx?.split_mode).toBe('everything');
    expect(
      tx?.metrics.some((m) => 'field' in m && m.field === 'kubernetes.pod.network.tx.bytes')
    ).toBe(true);
  });

  it('podOverview branches all four series per schema', () => {
    const semconv = podOverview(...args, 'semconv');
    const ecs = podOverview(...args, 'ecs');

    const semconvCpuFields = semconv.series
      .find((s) => s.id === 'cpu')!
      .metrics.map((m) => 'field' in m && m.field);
    expect(semconvCpuFields).toContain('metrics.k8s.pod.cpu_limit_utilization');

    const ecsCpuFields = ecs.series
      .find((s) => s.id === 'cpu')!
      .metrics.map((m) => 'field' in m && m.field);
    expect(ecsCpuFields).toContain('kubernetes.pod.cpu.usage.limit.pct');

    const semconvRx = semconv.series.find((s) => s.id === 'rx');
    expect(semconvRx?.filter).toEqual({ language: 'kuery', query: 'direction : "receive"' });
  });

  it('all pod models keep requires and ids unchanged in semconv', () => {
    for (const creator of [podCpuUsage, podMemoryUsage, podNetworkTraffic, podOverview]) {
      const model = creator(...args, 'semconv');
      expect(model.requires).toEqual(['kubernetes.pod']);
    }
  });
});
