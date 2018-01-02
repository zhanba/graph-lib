import { Graph, Nodes, EdgeObj, LabelValue } from './graph';

interface NodeObj {
  v: string,
  value: LabelValue,
  parent: string|undefined
}

interface JsonObj {
  options: {
    directed: boolean,
    multigraph: boolean,
    compound: boolean
  },
  nodes: object[],
  edges: object[],
  value: Graph
}

function write(g: Graph) {
  const json = {
    options: {
      directed: g.directed,
      multigraph: g.multigraph,
      compound: g.compound,
    },
    nodes: writeNodes(g),
    edges: writeEdges(g),
    value: Object.assign({}, g.graph())
  };

  return json;
}

function writeNodes(g: Graph) {
  return g.nodes().map(v => {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node = { v: v }
    if (nodeValue !== undefined) {
      node.value = nodeValue;
    }
    if (parent !== undefined) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g: Graph) {
  return g.edges().forEach(e => {
    const edgeValue = g.edge(e);
    const edge = {
      v: e.v,
      w: e.w,
    };
    if (e.name !== undefined) {
      edge.name = e.name;
    }
    if (edgeValue !== undefined) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

function read(json) {
  const g = new Graph(json.options).setGraph(json.value);
  json.nodes.forEach(entry => {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  json.edges.forEach(entry => {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value)
  });
}

export {
  write,
  read
}