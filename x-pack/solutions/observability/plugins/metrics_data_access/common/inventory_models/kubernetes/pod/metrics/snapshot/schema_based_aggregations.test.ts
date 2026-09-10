/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { cpu } from './cpu';
import { memory } from './memory';
import { rx } from './rx';
import { tx } from './tx';

describe('pod snapshot aggregations', () => {
  it('computes ECS cpu from limit pct with node pct fallback', () => {
    const ecsCpu = cpu.ecs as Record<string, any>;
    expect(ecsCpu.cpu_with_limit.avg.field).toBe('kubernetes.pod.cpu.usage.limit.pct');
    expect(ecsCpu.cpu_without_limit.avg.field).toBe('kubernetes.pod.cpu.usage.node.pct');
    expect(ecsCpu.cpu.bucket_script.script.source).toBe(
      'params.with_limit > 0.0 ? params.with_limit : params.without_limit'
    );
  });

  it('computes semconv cpu from limit utilization with node utilization fallback', () => {
    const semconvCpu = cpu.semconv as Record<string, any>;
    expect(semconvCpu.cpu_with_limit.avg.field).toBe('metrics.k8s.pod.cpu_limit_utilization');
    expect(semconvCpu.cpu_without_limit.avg.field).toBe('metrics.k8s.pod.cpu.node.utilization');
    expect(semconvCpu.cpu.bucket_script.script.source).toBe(
      'params.with_limit > 0.0 ? params.with_limit : params.without_limit'
    );
    expect(semconvCpu.cpu.bucket_script.gap_policy).toBe('insert_zeros');
  });

  it('computes semconv memory from limit utilization with node utilization fallback', () => {
    const semconvMemory = memory.semconv as Record<string, any>;
    expect(semconvMemory.memory_with_limit.avg.field).toBe(
      'metrics.k8s.pod.memory_limit_utilization'
    );
    expect(semconvMemory.memory_without_limit.avg.field).toBe(
      'metrics.k8s.pod.memory.node.utilization'
    );
    expect(semconvMemory.memory.bucket_script.gap_policy).toBe('skip');
  });

  it('computes semconv network rx/tx from k8s.pod.network.io split by direction', () => {
    const semconvRx = rx.semconv as Record<string, any>;
    const semconvTx = tx.semconv as Record<string, any>;

    expect(semconvRx.rx_dimension.filter).toEqual({ term: { direction: 'receive' } });
    expect(
      semconvRx.rx_dimension.aggs.rx_interfaces.aggregations.rx_interface_max.max.field
    ).toBe('metrics.k8s.pod.network.io');
    expect(semconvRx.rx_dimension.aggs.rx_interfaces.terms.field).toBe('interface');

    expect(semconvTx.tx_dimension.filter).toEqual({ term: { direction: 'transmit' } });
    expect(
      semconvTx.tx_dimension.aggs.tx_interfaces.aggregations.tx_interface_max.max.field
    ).toBe('metrics.k8s.pod.network.io');
  });

  it('keeps ECS network rx/tx on the beats cumulative byte counters', () => {
    const ecsRx = rx.ecs as Record<string, any>;
    const ecsTx = tx.ecs as Record<string, any>;
    expect(ecsRx.rx_max.max.field).toBe('kubernetes.pod.network.rx.bytes');
    expect(ecsTx.tx_max.max.field).toBe('kubernetes.pod.network.tx.bytes');
  });
});
