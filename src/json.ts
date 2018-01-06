import { Graph, LabelValue } from "./graph";

export interface INodeObj {
  v: string;
  value: LabelValue;
  parent: string|undefined;
}

export interface IEdgeObj {
  v: string;
  w: string;
  name: string|undefined;
  value: LabelValue;
}

export interface IJsonObj {
  options: {
    directed: boolean,
    multigraph: boolean,
    compound: boolean,
  };
  nodes: INodeObj[];
  edges: IEdgeObj[];
  value: Graph;
}

function write(g: Graph): IJsonObj {
  const json: IJsonObj = {
    edges: writeEdges(g),
    nodes: writeNodes(g),
    options: {
      compound: g.compound,
      directed: g.directed,
      multigraph: g.multigraph,
    },
    value: Object.assign({}, g.graph()),
  };

  return json;
}

function writeNodes(g: Graph): INodeObj[] {
  return g.nodes().map((v) => {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node: INodeObj = { v: v, value: undefined, parent: undefined };
    if (nodeValue !== undefined) {
      node.value = nodeValue;
    }
    if (parent !== undefined) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g: Graph): IEdgeObj[] {
  return g.edges().map(e => {
    const edgeValue = g.edge(e);
    const edge: IEdgeObj = {
      v: e.v,
      w: e.w,
      name: undefined,
      value: undefined
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

function read(json: IJsonObj): Graph {
  const g = new Graph(json.options).setGraph(json.value);
  json.nodes.forEach((entry) => {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  json.edges.forEach((entry) => {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}

export {
  write,
  read,
};
