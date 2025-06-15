import test from 'node:test';
import wayfarer from '../index.js';
import getAllRoutes from './helper/get-all-routes.js';

test('getAllRoutes', async t => {
  await t.test('should assert input types', t => {
    t.plan(1);
    t.assert.throws(getAllRoutes.bind(null), /function/, 'assert first arg is function');
  });

  await t.test('should getAllRoutes', t => {
    t.plan(4);
    const router = wayfarer();
    router.on('/foo', (x, y) => x * y);
    router.on('/bar', (x, y) => x / y);

    const routes = getAllRoutes(router);

    t.assert.equal(routes instanceof Object, true);
    t.assert.equal(Object.keys(routes).length, 2);
    t.assert.equal(typeof routes['/foo'], 'function');
    t.assert.equal(typeof routes['/bar'], 'function');
  });

  await t.test('should getAllRoutes from a nested tree', t => {
    t.plan(6);
    const router = wayfarer();
    router.on('/foo', (x, y) => x * y + 2);
    router.on('/foo/baz', (x, y) => x * y);
    router.on('/bar/bin/barb', (x, y) => x / y);
    router.on('/bar/bin/bla', (x, y) => x / y);

    const routes = getAllRoutes(router);

    t.assert.equal(routes instanceof Object, true);
    t.assert.equal(Object.keys(routes).length, 4);
    t.assert.equal(typeof routes['/foo'], 'function');
    t.assert.equal(typeof routes['/foo/baz'], 'function');
    t.assert.equal(typeof routes['/bar/bin/barb'], 'function');
    t.assert.equal(typeof routes['/bar/bin/bla'], 'function');
  });

  await t.test('should getAllRoutes from a routes with params', t => {
    t.plan(5);
    const router = wayfarer();
    router.on('/foo', (x, y) => x / y);
    router.on('/foo/:slug', (x, y) => x * y + 2);
    router.on('/foo/:slug/:id', (x, y) => x * y);

    const routes = getAllRoutes(router);

    t.assert.equal(routes instanceof Object, true);
    t.assert.equal(Object.keys(routes).length, 3);
    t.assert.equal(typeof routes['/foo'], 'function');
    t.assert.equal(typeof routes['/foo/:slug'], 'function');
    t.assert.equal(typeof routes['/foo/:slug/:id'], 'function');
  });
});
