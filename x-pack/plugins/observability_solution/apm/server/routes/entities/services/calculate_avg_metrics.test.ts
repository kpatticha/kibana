import { calculateAvgMetrics, mergeMetrics } from './calculate_avg_metrics';

describe('calculateAverageMetrics', () => {
  it('calculates average metrics', () => {
    const entities = [
      {
        agentName: 'nodejs',
        dataStreams: ['foo', 'bar'],
        environments: ['env-service-1', 'env-service-2'],
        latestTimestamp: '2024-03-05T10:34:40.810Z',
        metrics: [
          {
            failedTransactionRate: 5,
            latency: 5,
            logErrorRate: 5,
            logRatePerMinute: 5,
            throughput: 5,
          },
          {
            failedTransactionRate: 10,
            latency: 10,
            logErrorRate: 10,
            logRatePerMinute: 10,
            throughput: 10,
          },
        ],
        serviceName: 'service-1',
      },
      {
        agentName: 'java',
        dataStreams: ['baz'],
        environments: ['env-service-3', 'env-service-4'],
        latestTimestamp: '2024-06-05T10:34:40.810Z',
        metrics: [
          {
            failedTransactionRate: 15,
            latency: 15,
            logErrorRate: 15,
            logRatePerMinute: 15,
            throughput: 15,
          },
          {
            failedTransactionRate: 5,
            latency: 5,
            logErrorRate: 5,
            logRatePerMinute: 5,
            throughput: 5,
          },
        ],
        serviceName: 'service-2',
      },
    ];

    const result = calculateAvgMetrics(entities);

    expect(result).toEqual([
      {
        agentName: 'nodejs',
        dataStreams: ['foo', 'bar'],
        environments: ['env-service-1', 'env-service-2'],
        latestTimestamp: '2024-03-05T10:34:40.810Z',
        metrics: {
          failedTransactionRate: 7.5,
          latency: 7.5,
          logErrorRate: 7.5,
          logRatePerMinute: 7.5,
          throughput: 7.5,
        },
        serviceName: 'service-1',
      },
      {
        agentName: 'java',
        dataStreams: ['baz'],
        environments: ['env-service-3', 'env-service-4'],
        latestTimestamp: '2024-06-05T10:34:40.810Z',
        metrics: {
          failedTransactionRate: 10,
          latency: 10,
          logErrorRate: 10,
          logRatePerMinute: 10,
          throughput: 10,
        },
        serviceName: 'service-2',
      },
    ]);
  });
  it('calculates average metrics with null', () => {
    const entities = [
      {
        agentName: 'nodejs',
        dataStreams: ['foo', 'bar'],
        environments: ['env-service-1', 'env-service-2'],
        latestTimestamp: '2024-03-05T10:34:40.810Z',
        metrics: [
          {
            failedTransactionRate: 5,
            latency: null,
            logErrorRate: 5,
            logRatePerMinute: 5,
            throughput: 5,
          },
          {
            failedTransactionRate: 10,
            latency: null,
            logErrorRate: 10,
            logRatePerMinute: 10,
            throughput: 10,
          },
        ],
        serviceName: 'service-1',
      },
    ];

    const result = calculateAvgMetrics(entities);

    expect(result).toEqual([
      {
        agentName: 'nodejs',
        dataStreams: ['foo', 'bar'],
        environments: ['env-service-1', 'env-service-2'],
        latestTimestamp: '2024-03-05T10:34:40.810Z',
        metrics: {
          failedTransactionRate: 7.5,
          latency: null,
          logErrorRate: 7.5,
          logRatePerMinute: 7.5,
          throughput: 7.5,
        },
        serviceName: 'service-1',
      },
    ]);
  });
});

describe('mergeMetrics', () => {
  it('merges metrics correctly', () => {
    const metrics = [
      {
        failedTransactionRate: 5,
        latency: 5,
        logErrorRate: 5,
        logRatePerMinute: 5,
        throughput: 5,
      },
      {
        failedTransactionRate: 10,
        latency: 10,
        logErrorRate: 10,
        logRatePerMinute: 10,
        throughput: 10,
      },
    ];

    const result = mergeMetrics(metrics);

    expect(result).toEqual({
      failedTransactionRate: [5, 10],
      latency: [5, 10],
      logErrorRate: [5, 10],
      logRatePerMinute: [5, 10],
      throughput: [5, 10],
    });
  });

  it('handles empty metrics array', () => {
    const metrics: any[] = [];

    const result = mergeMetrics(metrics);

    expect(result).toEqual({});
  });
});
