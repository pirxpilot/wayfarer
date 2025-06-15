const test = require('node:test');

const wayfarer = require('../');
const walk = require('../lib/walk');

const noop = () => {};

test('walk', async t => {
  await t.test('should assert input types', t => {
    t.plan(3);
    t.assert.throws(walk.bind(null), /function/, 'assert first arg is function');
    t.assert.throws(walk.bind(null, noop), /function/, 'assert second arg is a function');
    t.assert.throws(walk.bind(null, noop, noop), /object/, 'assert trie exists');
  });

  await t.test('should walk a trie', t => {
    t.plan(2);
    const router = wayfarer();
    router.on('/foo', (x, y) => x * y);
    router.on('/bar', (x, y) => x / y);

    walk(router, (_route, cb) => {
      const y = 2;
      return (_params, x) => cb(x, y);
    });

    t.assert.equal(router('/foo', 4), 8, 'multiply');
    t.assert.equal(router('/bar', 8), 4, 'divide');
  });

  await t.test('should walk a nested trie', t => {
    t.plan(3);
    const router = wayfarer();
    router.on('/foo/baz', (x, y) => x * y);
    router.on('/bar/bin/barb', (x, y) => x / y);
    router.on('/bar/bin/bla', (x, y) => x / y);

    walk(router, (_route, cb) => {
      const y = 2;
      return (_params, x) => cb(x, y);
    });

    t.assert.equal(router('/foo/baz', 4), 8, 'multiply');
    t.assert.equal(router('/bar/bin/barb', 8), 4, 'divide');
    t.assert.equal(router('/bar/bin/bla', 8), 4, 'divide');
  });

  await t.test('should walk partials', t => {
    t.plan(4);
    const router = wayfarer();
    router.on('/foo', route => route);
    router.on('/:foo', route => route);
    router.on('/:foo/bar', route => route);
    router.on('/:foo/:bar', route => route);

    walk(router, (route, cb) => () => cb(route));

    t.assert.equal(router('/foo'), '/foo', 'no partials');
    t.assert.equal(router('/bleep'), '/:foo', 'one partial');
    t.assert.equal(router('/bleep/bar'), '/:foo/bar', 'partial and normal');
    t.assert.equal(router('/bleep/bloop'), '/:foo/:bar', 'two partials');
  });
});
