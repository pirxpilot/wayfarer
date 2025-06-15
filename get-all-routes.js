const assert = require('assert');

module.exports = getAllRoutes;

function transform({ nodes, name }, prev = '/') {
  const routes = {};

  for (const [key, node] of Object.entries(nodes)) {
    const path = (prev === '/' ? prev : `${prev}/`) + (key === '$$' ? `:${name}` : key);
    const { cb } = node;
    if (cb !== undefined) {
      routes[path] = cb;
    }
    if (Object.keys(node.nodes).length !== 0) {
      const obj = transform(nodes[key], path);
      for (const [key, value] of Object.entries(obj)) {
        routes[key] = value;
      }
    }
  }
  return routes;
}

// walk a wayfarer trie
// (obj, fn) -> null
function getAllRoutes(router) {
  assert.equal(typeof router, 'function', 'wayfarer.getAllRoutes: router should be an function');

  const trie = router._trie;
  assert.equal(typeof trie, 'object', 'wayfarer.getAllRoutes: trie should be an object');

  const tree = trie.trie;
  return transform(tree);
}
