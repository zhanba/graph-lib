import { Graph, KeyValue, LabelValue } from "./graph";

export interface INodeObj {
  v: KeyValue;
  value: LabelValue;
  parent: KeyValue|undefined;
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
  value: LabelValue;
}

function write(g: Graph): IJsonObj {
  const jsonObj: IJsonObj = {
    edges: writeEdges(g),
    nodes: writeNodes(g),
    options: {
      compound: g.compound,
      directed: g.directed,
      multigraph: g.multigraph,
    },
    value: typeof g.graph === "object" ? Object.assign({}, g.graph()) : g.graph(),
  };

  return jsonObj;
}

function writeNodes(g: Graph): INodeObj[] {
  return g.nodes().map((v) => {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node: INodeObj = { v, value: undefined, parent: undefined };
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
  return g.edges().map((e) => {
    const edgeValue = g.edge(e);
    const edge: IEdgeObj = {
      name: undefined,
      v: e.v,
      value: undefined,
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

function read(jsonObj: IJsonObj): Graph {
  const g = new Graph(jsonObj.options).setGraph(jsonObj.value);
  jsonObj.nodes.forEach((entry) => {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  jsonObj.edges.forEach((entry) => {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}

const json = {
  read,
  write,
};

export { json };
