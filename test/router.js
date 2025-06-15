const test = require('node:test');

const wayfarer = require('../');

const noop = () => {};

test('router', async t => {
  await t.test('should match a path', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/', () => {
      t.assert.ok('called');
    });
    r('/');
  });

  await t.test('should match a nested path', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/foo/bar', () => {
      t.assert.ok('called');
    });
    r('/foo/bar');
  });

  await t.test('should match a default path', t => {
    t.plan(1);
    const r = wayfarer('/404');
    r.on('/404', () => {
      t.assert.ok('default');
    });
    r('/nope');
  });

  await t.test('should allow passing of extra values', t => {
    t.plan(2);
    const foo = {};
    const bar = {};
    const r = wayfarer();
    r.on('/foo', (_params, arg1, arg2) => {
      t.assert.equal(arg1, foo, 'arg1 was passed');
      t.assert.equal(arg2, bar, 'arg2 was passed');
    });
    r('/foo', foo, bar);
  });

  await t.test('.on() should catch type errors', t => {
    t.plan(2);
    const r = wayfarer();
    t.assert.throws(r.on.bind(r, 123), /string/, 'string');
    t.assert.throws(r.on.bind(r, '/hi', 123), /function/, 'function');
  });

  await t.test('.emit() should match paths', t => {
    t.plan(2);
    const r = wayfarer();
    r.on('/foo/bar', _param => {
      t.assert.ok('bar called');
    });
    r.on('/foo/baz', _param => {
      t.assert.ok('baz called');
    });
    r('/foo/bar');
    r('/foo/baz');
  });

  await t.test('.match() should match paths', t => {
    t.plan(2);
    const r = wayfarer();
    r.on('/foo/bar', () => {
      t.fail('should not call callback');
    });
    r.on('/foo/baz', noop);

    const bar = r.match('/foo/bar');
    t.assert.equal(bar.route, '/foo/bar');

    const baz = r.match('/foo/baz');
    t.assert.equal(baz.route, '/foo/baz');
  });

  await t.test('.emit() should match partials', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/:user', param => {
      t.assert.equal(param.user, 'tobi', 'param matched');
    });
    r('/tobi');
  });

  await t.test('.match() should match partials', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/:user', noop);
    const toby = r.match('/tobi');
    t.assert.equal(toby.params.user, 'tobi');
  });

  await t.test('.emit() should match paths before partials', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/foo', () => {
      t.assert.ok('called');
    });
    r.on('/:user', noop);
    r('/foo');
  });

  await t.test('.emit() should allow path overriding', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/:user', () => {
      t.fail('wrong callback called');
    });
    r.on('/:user', () => {
      t.assert.ok('called');
    });
    r('/foo');
  });

  await t.test('.emit() should match nested partials', t => {
    t.plan(2);
    const r = wayfarer();
    r.on('/:user/:name', param => {
      t.assert.equal(param.user, 'tobi', 'param matched');
      t.assert.equal(param.name, 'baz', 'param matched');
    });
    r('/tobi/baz');
  });

  await t.test('.emit() should parse encoded params', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/:channel', param => {
      t.assert.equal(param.channel, '#choo', 'param matched');
    });
    r('/%23choo');
  });

  await t.test('.emit() should throw if no matches are found', t => {
    t.plan(1);
    const r1 = wayfarer();
    t.assert.throws(r1.bind(r1, '/woops'), /route/, 'no matches found');
  });

  await t.test('.emit() should return values', t => {
    t.plan(1);
    const r1 = wayfarer();
    r1.on('/foo', () => 'hello');
    t.assert.equal(r1('foo'), 'hello', 'returns value');
  });

  await t.test('.emit() mount subrouters', t => {
    t.plan(5);

    const r4 = wayfarer();
    const r3 = wayfarer();
    r4.on('/kidlette', () => {
      t.assert.ok('nested 2 levels');
    });
    r3.on('/mom', r4);
    r3('/mom/kidlette');

    const r1 = wayfarer();
    const r2 = wayfarer();
    r2.on('/', () => {
      t.assert.ok('nested 1 level');
    });
    r1.on('/home', r2);
    r1('/home');

    const r5 = wayfarer();
    const r6 = wayfarer();
    r6.on('/child', param => {
      t.assert.equal(typeof param, 'object', 'param is passed');
      t.assert.equal(param.parent, 'hello', 'nested 2 levels with params');
    });
    r5.on('/:parent', r6);
    r5('/hello/child');

    const r7 = wayfarer();
    const r8 = wayfarer();
    const r9 = wayfarer();
    r9.on('/bar', _param => {
      t.assert.ok('called', 'nested 3 levels');
    });
    r8.on('/bin', r9);
    r7.on('/foo', r8);
    r7('/foo/bin/bar');
  });

  await t.test('.emit() should match nested partials of subrouters', t => {
    t.plan(3);
    const r1 = wayfarer();
    const r2 = wayfarer();
    const r3 = wayfarer();
    r3.on('/:grandchild', param => {
      t.assert.equal(param.parent, 'bin', 'nested 3 levels with params');
      t.assert.equal(param.child, 'bar', 'nested 3 levels with params');
      t.assert.equal(param.grandchild, 'baz', 'nested 3 levels with parmas');
    });
    r2.on('/:child', r3);
    r1.on('/foo/:parent', r2);
    r1('/foo/bin/bar/baz');
  });

  await t.test('.match() should return nested partials of subrouters', t => {
    t.plan(3);
    const r1 = wayfarer();
    const r2 = wayfarer();
    const r3 = wayfarer();
    r3.on('/:grandchild', noop);
    r2.on('/:child', r3);
    r1.on('/foo/:parent', r2);
    const matched = r1.match('/foo/bin/bar/baz');
    t.assert.equal(matched.params.parent, 'bin');
    t.assert.equal(matched.params.child, 'bar');
    t.assert.equal(matched.params.grandchild, 'baz');
  });

  await t.test('.match() returns a handler of a route', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/:user', () => {
      t.assert.ok('called');
    });
    const toby = r.match('/tobi');
    toby.cb();
  });

  await t.test('nested routes should call parent default route', t => {
    t.plan(4);
    const r1 = wayfarer('/404');
    const r2 = wayfarer();
    const r3 = wayfarer();

    r2.on('/bar', r3);
    r1.on('foo', r2);
    r1.on('/404', pass);

    r1('');
    r1('foo');
    r1('foo/bar');
    r1('foo/beep/boop');

    function pass(_params) {
      t.assert.ok('called');
    }
  });

  await t.test('aliases', t => {
    t.plan(1);
    const r = wayfarer();
    t.assert.equal(r, r.emit);
  });

  await t.test('wildcards', t => {
    t.plan(3);
    const r = wayfarer();

    r.on('/bar/*', params => {
      t.assert.equal(params.wildcard, 'foo/beep/boop');
    });

    r.on('/foo/:match/*', params => {
      t.assert.equal(params.match, 'bar');
      t.assert.equal(params.wildcard, 'beep/boop');
    });

    r('/bar/foo/beep/boop');
    r('/foo/bar/beep/boop');
  });

  await t.test('wildcards dont conflict with params', t => {
    t.plan(3);
    let router;

    router = wayfarer();
    router.on('/*', _params => {
      t.fail('wildcard called');
    });
    router.on('/:match', _params => {
      t.assert.ok('param called');
    });
    router('/foo');

    router = wayfarer();
    router.on('/*', _params => {
      t.fail('wildcard called');
    });
    router.on('/:match/foo', _params => {
      t.assert.ok('param called');
    });
    router('/foo/foo');

    router = wayfarer();
    router.on('/*', _params => {
      t.assert.ok('wildcard called');
    });
    router.on('/:match/foo', _params => {
      t.fail('param called');
    });
    router('/foo/bar');
  });

  await t.test('safe decodeURIComponent', t => {
    t.plan(1);
    const r = wayfarer('/404');
    r.on('/test/:id', _params => {
      t.fail('we should not be here');
    });
    r.on('/404', () => {
      t.assert.ok('called');
    });
    r('/test/hel%"Flo');
  });

  await t.test('safe decodeURIComponent - nested route', t => {
    t.plan(1);
    const r = wayfarer('/404');
    r.on('/test/hello/world/:id/blah', _params => {
      t.fail('we should not be here');
    });
    r.on('/404', () => {
      t.assert.ok('called');
    });
    r('/test/hello/world/hel%"Flo/blah');
  });

  await t.test('safe decodeURIComponent - wildcard', t => {
    t.plan(1);
    const r = wayfarer('/404');
    r.on('/test/*', _params => {
      t.fail('we should not be here');
    });
    r.on('/404', () => {
      t.assert.ok('called');
    });
    r('/test/hel%"Flo');
  });

  await t.test('should expose .route property', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/foo', () => {});
    t.assert.equal(r.match('/foo').route, '/foo', 'exposes route property');
  });

  await t.test('should be called with self', t => {
    t.plan(1);
    const r = wayfarer();
    r.on('/foo', function callback() {
      t.assert.equal(this, callback, 'calling context is self');
    });
    r('/foo');
  });

  await t.test('can register callback on many routes', t => {
    t.plan(6);
    const r = wayfarer();
    const routes = ['/foo', '/bar'];
    r.on('/foo', callback);
    r.on('/bar', callback);
    for (const route of routes) {
      const matched = r.match(route);
      t.assert.equal(matched.cb, callback, 'matched callback is same');
      t.assert.equal(matched.route, route, 'matched route is same');
      r(route);
    }
    function callback() {
      t.assert.equal(this, callback, 'calling context is same');
    }
  });
});
