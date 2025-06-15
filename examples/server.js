import http from 'node:http';
import methodist from 'methodist';
import wayfarer from 'wayfarer';

const server = http.createServer((req, _res) => {
  const router = wayfarer();
  const method = methodist(req, router);

  router.on(
    '/hello',
    method({
      all: _params => console.log('any route matches'),
      get: _params => console.log('get')
    })
  );

  router(req);
});

server.listen(1337);
