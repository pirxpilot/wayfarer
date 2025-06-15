const assert = require('assert');

module.exports = walk;

// walk a wayfarer trie
// (obj, fn) -> null
function walk(router, transform) {
  assert.equal(typeof router, 'function', 'wayfarer.walk: router should be an function');
  assert.equal(typeof transform, 'function', 'wayfarer.walk: transform should be a function');

  const trie = router._trie;
  assert.equal(typeof trie, 'object', 'wayfarer.walk: trie should be an object');

  // (str, obj) -> null
  _walk('', trie.trie);

  function _walk(route, trie) {
    if (trie.cb) {
      trie.cb = transform(route, trie.cb);
    }
    const { name, nodes } = trie;

    if (nodes) {
      for (const [key, node] of Object.entries(nodes)) {
        const newRoute = key === '$$' ? `${route}/:${name}` : `${route}/${key}`;
        _walk(newRoute, node);
      }
    }
  }
}
