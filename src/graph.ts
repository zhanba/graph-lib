import { isEmpty } from 'lodash'

const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

export interface GraphConstructor {
  directed?: boolean,
  multigraph?: boolean,
  compound?: boolean
}

export interface Node {

}

export interface Nodes {
  [nodeLabel: string]: Node
}

export interface Edge {

}

export interface EdgeObjs {
  [edgeLabel: string]: Edge
}

export interface DefaultNodeLabelFn {
  (v: string): string
}

export interface DefaultEdgeLabelFn {
  (): string
}

// interface GraphInterface {
//   directed: boolean,
//   multigraph: boolean,
//   compound: boolean
// }

class Graph {
  readonly directed: boolean;
  readonly multigraph: boolean;
  readonly compound: boolean;

  constructor(opt: GraphConstructor) {
    this.directed = opt.directed ? opt.directed : true;
    this.multigraph = opt.multigraph ? opt.multigraph : false;
    this.compound = opt.compound ? opt.compound : false;
  }

  // Defaults to be set when creating a new node
  private defaultNodeLabelFn: DefaultNodeLabelFn;

  private defaultEdgeLabelFn: DefaultEdgeLabelFn

  // Label for the graph itself
  label: string;

  // v -> label
  nodes: Nodes;

  // v -> parent
  parent?: Graph;

  // v -> children
  children?: Graph;
  // this._children[GRAPH_NODE] = {};

  // v -> edgeObj
  in: Edge;

  // u -> v -> Number
  preds: number;

  // v -> edgeObj
  out: Edge;

  // v -> w -> Number
  sucs: number;

  // e -> edgeObj
  edgeObjs: EdgeObjs;

  // e -> label
  // TODO
  edgeLabels: object;

  /* Number of nodes in the graph. Should only be changed by the implementation. */
  private nodeCountNumber = 0;

  /* Number of edges in the graph. Should only be changed by the implementation. */
  private edgeCountNumber = 0;


  /* === Graph functions ========= */
  setGraph(label: string): Graph {
    this.label = label;
    return this;
  }

  graph(): Graph {
    return this;
  }

  /* === Node functions ========== */
  setDefaultNodeLabel(newDefault: DefaultNodeLabelFn): Graph {
    // TODO
    this.defaultNodeLabelFn = newDefault;
    return this;
  }

  nodeCount(): number {
    return this.nodeCountNumber;
  }

  nodesLabel(): string[] {
    return Object.keys(this.nodes);
  }

  sources(): string[] {
    return this.nodesLabel().filter(v => isEmpty(this.in[v]))
  }

  sinks(): string[] {
    return this.nodesLabel().filter(v => isEmpty(this.out[v]))
  }

  setNodes(vs: string[], value?: Node): Graph {
    const args = arguments;
    vs.forEach(v => {
      if (args.length > 1) {
        this.setNode(v, value);
      } else {
        this.setNode(v);
      }
    });
    return this;
  }

  setNode(v: string, value?: Node): Graph {
    if (this.hasNode(v)) {
      if (arguments.length > 1) {
        this.nodes[v] = value;
      } else {
        throw new Error('missing node value');
      }
      return this;
    }

    this.nodes[v] = arguments.length > 1 ? value : this.defaultNodeLabelFn(v);

    if (this.compound) {
      this.parent[v] = GRAPH_NODE;
      this.children[v] = {};
      this.children[GRAPH_NODE][v] = true;
    }
    this.in[v] = {};
    this.preds[v] = {};
    this.out[v] = {};
    this.sucs[v] = {};
    ++this.nodeCountNumber;
    return this;
  }

  node(v: string) {
    return this.nodes[v];
  }

  hasNode(v: string) {
    return Object.keys(this.nodes).includes(v)
  }

  removeNode(v: string): Graph {
    if (this.hasNode(v)) {
      let removeEdge = (e: Edge) => {this.removeEdge(this.edgeObjs[e])}
      delete this.nodes[v]
      if (this.compound) {
        this.removeFromParentsChildList(v);
        delete this.parent[v];
        this.children[v].forEach(child => this.setParent(child));
        delete this.children[v];
      }

      this.in[v].forEach(removeEdge);
      delete this.in[v];
      delete this.preds[v];
      this.out[v].forEach(removeEdge);
      delete this.out[v];
      delete this.sucs[v];
      --this.nodeCountNumber;
    }
    return this;
  }

  setParent(v: string, parent = GRAPH_NODE): Graph {
    if (!this.compound) {
      throw new Error('Cannot set parent in a non-compound graph')
    }

    // Coerce parent to string
    parent += "";

    for (let ancestor = parent; ancestor !== undefined; ancestor = this.parent(ancestor)) {
      if (ancestor === v) {
        throw new Error(`Setting ${parent} as parent of ${v} would create a cycle`);
      }
    }

    this.setNode(parent);

    this.setNode(v);
    this.removeFromParentsChildList(v);
    this.parent[v] = parent;
    this.children[parent][v] = true;

    return this;
  }

  removeFromParentsChildList(v: string) {
    delete this.children[this.parent[v]][v];
  }

  parent(v) {
    if (this.compound) {
      
    }
  } 
}

export {
  Graph
}
