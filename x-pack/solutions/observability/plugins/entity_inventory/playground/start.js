/*
 * Local only, excluded from git through .git/info/exclude. Serves a page that runs the entity
 * inventory generator and executor step by step against a local Elasticsearch.
 *
 *   node x-pack/solutions/observability/plugins/entity_inventory/playground/start.js
 *
 * Environment: ES_URL (http://localhost:9200), ES_USERNAME (elastic), ES_PASSWORD (changeme),
 * PORT (5700).
 */

require('../../../../../../src/setup_node_env');
require('./server').start();
