import assert from 'assert';

// create a new trie
// null -> obj
class Trie {
  constructor() {
    this.trie = { nodes: {} };
  }

  // create a node on the trie at route
  // and return a node
  // str -> obj
  create(route) {
    assert.equal(typeof route, 'string', 'route should be a string');
    // strip leading '/' and split routes
    const routes = route.replace(/^\//, '').split('/');

    function createNode(index, trie) {
      const thisRoute = has(routes, index) && routes[index];
      if (thisRoute === false) return trie;

      let node = null;
      if (/^:|^\*/.test(thisRoute)) {
        // if node is a name match, set name and append to ':' node
        if (!has(trie.nodes, '$$')) {
          node = { nodes: {} };
          trie.nodes.$$ = node;
        } else {
          node = trie.nodes.$$;
        }

        if (thisRoute[0] === '*') {
          trie.wildcard = true;
        }

        trie.name = thisRoute.replace(/^:|^\*/, '');
      } else if (!has(trie.nodes, thisRoute)) {
        node = { nodes: {} };
        trie.nodes[thisRoute] = node;
      } else {
        node = trie.nodes[thisRoute];
      }

      // we must recurse deeper
      return createNode(index + 1, node);
    }

    return createNode(0, this.trie);
  }

  // match a route on the trie
  // and return the node
  // str -> obj
  match(route) {
    assert.equal(typeof route, 'string', 'route should be a string');

    const routes = route.replace(/^\//, '').split('/');
    const params = {};

    function search(index, trie) {
      // either there's no match, or we're done searching
      if (trie === undefined) return undefined;
      const thisRoute = routes[index];
      if (thisRoute === undefined) return trie;

      if (has(trie.nodes, thisRoute)) {
        // match regular routes first
        return search(index + 1, trie.nodes[thisRoute]);
      }
      // match named routes
      if (trie.name) {
        try {
          params[trie.name] = decodeURIComponent(thisRoute);
        } catch (_e) {
          return search(index, undefined);
        }
        return search(index + 1, trie.nodes.$$);
      }
      // match wildcards
      if (trie.wildcard) {
        try {
          params.wildcard = decodeURIComponent(routes.slice(index).join('/'));
        } catch (_e) {
          return search(index, undefined);
        }
        // return early, or else search may keep recursing through the wildcard
        return trie.nodes.$$;
      }
      // no matches found
      return search(index + 1);
    }

    const node = search(0, this.trie);

    if (!node) return undefined;
    return { ...node, params };
  }

  // mount a trie onto a node at route
  // (str, obj) -> null
  mount(route, trie) {
    assert.equal(typeof route, 'string', 'route should be a string');
    assert.equal(typeof trie, 'object', 'trie should be a object');

    const split = route.replace(/^\//, '').split('/');
    let node = null;
    let key = null;

    if (split.length === 1) {
      key = split[0];
      node = this.create(key);
    } else {
      const head = split.join('/');
      key = split[0];
      node = this.create(head);
    }

    Object.assign(node.nodes, trie.nodes);
    if (trie.name) node.name = trie.name;

    // delegate properties from '/' to the new node
    // '/' cannot be reached once mounted
    if (node.nodes['']) {
      for (const key of Object.keys(node.nodes[''])) {
        if (key !== 'nodes') node[key] = node.nodes[''][key];
      }
      Object.assign(node.nodes, node.nodes[''].nodes);
      node.nodes[''].nodes = undefined;
    }
  }
}

function has(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

export default () => new Trie();
