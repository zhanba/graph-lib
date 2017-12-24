const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

export interface GraphConstructor {
  directed?: boolean,
  multigraph?: boolean,
  compound?: boolean
}

export interface DefaultNodeLabelFn {
  (label: string): void
}

// interface GraphInterface {
//   directed: boolean,
//   multigraph: boolean,
//   compound: boolean
// }

class Graph {
  private nodeCount = 0;
  private edgeCount = 0;

  readonly directed: boolean;
  readonly multigraph: boolean;
  readonly compound: boolean;

  constructor(opt: GraphConstructor) {
    this.directed = opt.directed ? opt.directed : true;
    this.multigraph = opt.multigraph ? opt.multigraph : false;
    this.compound = opt.compound ? opt.compound : false;
  }

  // Label for the graph itself
  label: string;

  /* === Graph functions ========= */
  setGraph(label: string): Graph {
    this.label = label;
    return this;
  }

  graph(): Graph {
    return this;
  }

  private defaultNodeLabelFn: DefaultNodeLabelFn;

  /* === Node functions ========== */
  setDefaultNodeLabel(newDefault: DefaultNodeLabelFn): Graph {
    this.defaultNodeLabelFn = newDefault;
    return this;
  }

  nodeCount()

}

export {
  Graph
}
