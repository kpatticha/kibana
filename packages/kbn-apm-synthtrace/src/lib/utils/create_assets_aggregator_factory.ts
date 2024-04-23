/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { appendHash, Fields } from '@kbn/apm-synthtrace-client';
import { getCreateBaseAggregatorFactory } from './create_base_aggregator_factory';

// export function assetsAggregatorFactory<TFields extends Fields>() {
//   return function <TAsset extends Record<string, any>, TOutput extends Record<string, any>>(
//     {
//       filter,
//       getAggregateKey,
//       init,
//     }: {
//       filter: (event: TFields) => boolean;
//       getAggregateKey: (event: TFields) => string;
//       init: (event: TFields, firstSeen: string, lastSeen: string) => TAsset;
//     },
//     reduce: (asset: TAsset, event: TFields) => void,
//     serialize: (asset: TAsset) => TOutput
//   ) {
//     const assets: Map<string, TAsset> = new Map();
//     let toFlush: TAsset[] = [];
//     let cb: (() => void) | undefined;

//     function flush(stream: Duplex, includeCurrentAssets: boolean, callback?: () => void) {
//       const allItems = [...toFlush];

//       toFlush = [];

//       if (includeCurrentAssets) {
//         allItems.push(...assets.values());
//         assets.clear();
//       }

//       while (allItems.length) {
//         const next = allItems.shift()!;
//         const serialized = serialize(next);
//         const shouldWriteNext = stream.push(serialized);
//         if (!shouldWriteNext) {
//           toFlush = allItems;
//           cb = callback;
//           return;
//         }
//       }

//       const next = cb;
//       cb = undefined;
//       next?.();
//       callback?.();
//     }

//     const timeRanges: number[] = [];

//     return new PassThrough({
//       objectMode: true,
//       read() {
//         flush(this, false, cb);
//       },
//       final(callback) {
//         flush(this, true, callback);
//       },
//       write(event: TFields, encoding, callback) {
//         if (!filter(event)) {
//           callback();
//           return;
//         }
//         timeRanges.push(event['@timestamp']!);
//         const firstSeen = new Date(Math.min(...timeRanges)).toISOString();
//         const lastSeen = new Date(Math.max(...timeRanges)).toISOString();

//         const key = appendHash(getAggregateKey(event), '');

//         let asset = assets.get(key);

//         if (asset) {
//           // @ts-ignore
//           asset['asset.last_seen'] = lastSeen;
//         } else {
//           asset = init({ ...event }, firstSeen, lastSeen);
//           assets.set(key, asset);
//         }

//         reduce(asset, event);
//         callback();
//       },
//     });
//   };
// }

export function createAssetsAggregatorFactory<TFields extends Fields>() {
  const createBaseAggregatorFactory = getCreateBaseAggregatorFactory<TFields>();
  return function <TMetric extends Record<string, any>, TOutput extends Record<string, any>>(
    {
      filter,
      getAggregateKey,
      init,
    }: {
      filter: (event: TFields) => boolean;
      getAggregateKey: (event: TFields) => string;
      init: (event: TFields, firstSeen: string, lastSeen: string) => TMetric;
    },
    reduce: (metric: TMetric, event: TFields) => void,
    serialize: (metric: TMetric) => TOutput
  ) {
    const timeRanges: number[] = [];

    return createBaseAggregatorFactory(
      {
        filter,
        getHashedKeys: (event) => appendHash(getAggregateKey(event), ''),
        init: (event, aggregatedDocument) => {
          timeRanges.push(event['@timestamp']!);
          const firstSeen = new Date(Math.min(...timeRanges)).toISOString();
          const lastSeen = new Date(Math.max(...timeRanges)).toISOString();

          let asset = aggregatedDocument;

          if (asset) {
            // @ts-ignore
            asset['asset.last_seen'] = lastSeen;
          } else {
            asset = init({ ...event }, firstSeen, lastSeen);
          }
          return { doc: asset };
        },
      },
      reduce,
      serialize
    );
  };
}
