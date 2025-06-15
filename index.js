const assert = require('assert');
const trie = require('./lib/trie');

module.exports = Wayfarer;

// create a router
// str -> obj
function Wayfarer(dft) {
  const _default = (dft || '').replace(/^\//, '');
  const _trie = trie();

  emit._trie = _trie;
  emit.on = on;
  emit.emit = emit;
  emit.match = match;
  emit._wayfarer = true;

  return emit;

  // define a route
  // (str, fn) -> obj
  function on(route, cb) {
    assert(typeof route === 'string');
    assert(typeof cb === 'function');

    route = route || '/';

    if (cb._wayfarer && cb._trie) {
      _trie.mount(route, cb._trie.trie);
    } else {
      const node = _trie.create(route);
      node.cb = cb;
      node.route = route;
    }

    return emit;
  }

  // match and call a route
  // (str, obj?) -> null
  function emit(route, ...args) {
    const { cb, params } = match(route);
    return cb.apply(cb, [params, ...args]);
  }

  function match(route) {
    assert(route != null, "'route' must be defined");

    const matched = _trie.match(route);
    if (matched?.cb) return new Route(matched);

    const dft = _trie.match(_default);
    if (dft?.cb) return new Route(dft);

    throw new Error(`route '${route}' did not match`);
  }

  function Route({ cb, route, params }) {
    this.cb = cb;
    this.route = route;
    this.params = params;
  }
}
