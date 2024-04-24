/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export { withPerformanceMetrics, perfomanceMarks } from './with_performance_metrics';
export type { WithPerformanceMetricsProps } from './types';
export { PerformanceContextProvider } from './context/performance_context';
export { usePerformanceContext } from './context/use_performance_context';
