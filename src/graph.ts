import { isEmpty, union, isFunction } from 'lodash'

const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

export type LabelValue =  string | number | boolean | object | undefined;

export interface GraphConstructor {
  directed?: boolean,
  multigraph?: boolean,
  compound?: boolean
}

export interface Nodes {
  [nodename: string]: LabelValue
}

export interface Count {
  [key: string]: number
}

export interface NodeCount {
  [key: string]: Count
}

export interface EdgeLabels {
  [e: string]: LabelValue
}

export interface EdgeObj {
  v: string,
  w: string,
  name?: string
}

export interface EdgeObjs {
  [e: string]: EdgeObj
}

export interface Edges {
  [v: string]: EdgeObj
}

export interface DefaultLabelFn {
  (v: any): LabelValue
}

export interface DefaultEdgeLabelFn {
  (v: string, w: string, name: string): LabelValue
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
  private defaultNodeLabelFn: DefaultLabelFn;

  private defaultEdgeLabelFn: DefaultEdgeLabelFn;

  // Label for the graph itself
  label: LabelValue;

  // v -> label
  nodesObj: Nodes;

  // v -> parent
  parentObj?: Graph;

  // v -> children
  childrenObj?: Graph;
  // this._children[GRAPH_NODE] = {};

  // v -> edgeObj
  in: Edges;

  // u -> v -> Number
  preds: NodeCount;

  // v -> edgeObj
  out: Edges;

  // v -> w -> Number
  sucs: NodeCount;

  // e -> edgeObj
  edgeObjs: EdgeObjs;

  // e -> label
  edgeLabels: EdgeLabels;

  /* Number of nodes in the graph. Should only be changed by the implementation. */
  private nodeCountNumber = 0;

  /* Number of edges in the graph. Should only be changed by the implementation. */
  private edgeCountNumber = 0;


  /* === Graph functions ========= */
  setGraph(label: LabelValue): Graph {
    this.label = label;
    return this;
  }

  graph(): Graph {
    return this;
  }

  /* === Node functions ========== */
  setDefaultNodeLabel(newDefault: LabelValue | DefaultLabelFn): Graph {
    if (typeof newDefault !== 'function') {
      newDefault = () => newDefault;
    }
    this.defaultNodeLabelFn = newDefault;
    return this;
  }

  nodeCount(): number {
    return this.nodeCountNumber;
  }

  nodes(): string[] {
    return Object.keys(this.nodesObj);
  }

  sources(): string[] {
    return this.nodes().filter(v => isEmpty(this.in[v]))
  }

  sinks(): string[] {
    return this.nodes().filter(v => isEmpty(this.out[v]))
  }

  setNodes(vs: string[], value: LabelValue): Graph {
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

  setNode(v: string, value?: LabelValue): Graph {
    if (this.hasNode(v)) {
      if (arguments.length > 1) {
        this.nodesObj[v] = value;
      } else {
        throw new Error('missing node value');
      }
      return this;
    }

    this.nodesObj[v] = arguments.length > 1 ? value : this.defaultNodeLabelFn(v);

    if (this.compound) {
      this.parentObj[v] = GRAPH_NODE;
      this.childrenObj[v] = {};
      this.childrenObj[GRAPH_NODE][v] = true;
    }
    this.in[v] = {};
    this.preds[v] = {};
    this.out[v] = {};
    this.sucs[v] = {};
    ++this.nodeCountNumber;
    return this;
  }

  node(v: string) {
    return this.nodesObj[v];
  }

  hasNode(v: string) {
    return Reflect.has(this.nodesObj, v);
  }

  removeNode(v: string): Graph {
    if (this.hasNode(v)) {
      let removeEdge = (e: EdgeObj) => {this.removeEdge(this.edgeObjs[e])}
      delete this.nodesObj[v]
      if (this.compound) {
        this.removeFromParentsChildList(v);
        delete this.parentObj[v];
        this.childrenObj[v].forEach(child => this.setParent(child));
        delete this.childrenObj[v];
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

    for (let ancestor = parent; ancestor !== undefined; ancestor = this.parentObj(ancestor)) {
      if (ancestor === v) {
        throw new Error(`Setting ${parent} as parent of ${v} would create a cycle`);
      }
    }

    this.setNode(parent);

    this.setNode(v);
    this.removeFromParentsChildList(v);
    this.parentObj[v] = parent;
    this.childrenObj[parent][v] = true;

    return this;
  }

  removeFromParentsChildList(v: string) {
    delete this.childrenObj[this.parentObj[v]][v];
  }

  parent(v: string): string|undefined {
    if (this.compound) {
      const parent = this.parentObj[v];
      if (parent !== GRAPH_NODE) {
        return parent
      }
    }
  }

  children(v = GRAPH_NODE): string[] {
    if (this.compound) {
      const children = this.childrenObj[v];
      if (children) {
        return Object.keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    }
    return [];
  }

  predecessors(v: string): string[] {
    const predsV = this.preds[v];
    if (predsV) {
      return Object.keys(predsV);
    }
    return [];
  }

  successors(v: string): string[] {
    const sucsV = this.sucs[v];
    if (sucsV) {
      return Object.keys(sucsV)
    }
    return [];
  }

  neighbors(v: string): string[] {
    const preds = this.predecessors(v);
    const sucs = this.successors(v);
    if (preds) {
      return union(preds, sucs);
    }
    return [];
  }

  isLeaf(v: string): boolean {
    let neighbors;
    if (this.directed) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    return neighbors.length === 0;
  }

  filterNodes(filter: (v: string) => boolean): Graph {
    const copy = new Graph({
      directed: this.directed,
      multigraph: this.multigraph,
      compound: this.compound
    });

    copy.setGraph(this.graph());

    for (const v in this.nodesObj) {
      if (this.nodesObj.hasOwnProperty(v)) {
        const value = this.nodesObj[v];
        if (filter(v)) {
          copy.setNode(v, value)
        }
      }
    }

    this.edgeObjs
    // TODO
  }

  /* === Edge functions ========== */
  setDefaultEdgeLabel(newDefault: LabelValue | DefaultLabelFn) {
    if (typeof newDefault !== 'function') {
      newDefault = () => newDefault;
    }
    this.defaultEdgeLabelFn = newDefault
    return this;
  }

  edgeCount(): number {
    return this.edgeCountNumber;
  }

  edges(): EdgeObj[] {
    return Object.values(this.edgeObjs);
  }

  setPath(vs: string[], value?: LabelValue): Graph {
    const args = arguments;
    vs.reduce((v, w) => {
      if (args.length > 1) {
        this.setEdge(v, w, value);
      } else {
        this.setEdge(v, w);
      }
      return w;
    });
    return this;
  }

  /*
  * setEdge(v, w, [value, [name]])
  * setEdge({ v, w, [name] }, [value])
  */
  setEdge(edgeobj: EdgeObj, value?: LabelValue): Graph;
  setEdge(v: string, w: string, value?: LabelValue, name?: string): Graph;
  setEdge(x: any): any {
    let v, w, name, value;
    let valueSpecified = false;
    const arg0 = arguments[0];

    if (typeof arg0 === 'object' && arg0 !== null && 'v' in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }

    v = '' + v;
    w = '' + w;
    if (name !== undefined) {
      name = '' + name
    }

    const e = edgeArgsToId(this.directed, v, w, name);
    if (Reflect.has(this.edgeLabels, e)) {
      if (valueSpecified) {
        this.edgeLabels[e] = value;
      }
      return this;
    }

    if (name !== undefined && !this.multigraph) {
      throw new Error('Cannot set a named edge when isMultigraph = false');
    }

    // It didn't exist, so we need to create it.
    // First ensure the nodes exist.
    this.setNode(v);
    this.setNode(w);

    this.edgeLabels[e] = valueSpecified ? value : this.defaultEdgeLabelFn(v, w, name);

    const edgeObj = edgeArgsToObj(this.directed, v, w, name);
      // Ensure we add undirected edges in a consistent way.
    v = edgeObj.v;
    w = edgeObj.w;

    Object.freeze(edgeObj);

    this.edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this.preds[w], v);
    incrementOrInitEntry(this.sucs[v], w);

    this.in[w][e] = edgeObj;
    this.out[v][e] = edgeObj;
    this.edgeCountNumber++;
    return this;
  }
  
  edge(v: string, w: string, name: string): LabelValue;
  edge(edgeObj: EdgeObj): LabelValue;
  edge(v: any): any {
    const e = arguments.length === 1 
      ? edgeObjToId(this.directed, arguments[0]) 
      : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    return this.edgeLabels[e];
  }

  hasEdge(v: string, w: string, name: string): boolean;
  hasEdge(edgeObj: EdgeObj): boolean;
  hasEdge(v: any): any {
    const e = arguments.length === 1 
      ? edgeObjToId(this.directed, arguments[0]) 
      : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    return Reflect.has(this.edgeLabels, e);
  }

  removeEdge(v: string, w: string, name: string): Graph;
  removeEdge(edgeObj: EdgeObj): Graph;
  removeEdge(v: any): any {
    const e = arguments.length === 1 
      ? edgeObjToId(this.directed, arguments[0]) 
      : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    const edge = this.edgeObjs[e];
    if (edge) {
      const v = edge.v;
      const w = edge.w;
      delete this.edgeLabels[e];
      delete this.edgeObjs[e];
      decrementOrRemoveEntry(this.preds[w], v);
      decrementOrRemoveEntry(this.sucs[v], w);
      delete this.in[w][e];
      delete this.out[v][e];
      this.edgeCountNumber--;
    }
    return this;
  }

  inEdges(v: string, u?: string): EdgeObj[] {
    const inV = this.in[v];
    if (inV) {
      const edges = Object.values(inV);
      if (!u) {
        return edges;
      }
      return edges.filter(edge => edge.v === u);
    }
    return [];
  }

  outEdges(v: string, w?: string): EdgeObj[] {
    const outV = this.out[v];
    if (outV) {
      const edges = Object.values(outV);
      if (!w) {
        return edges;
      }
      return edges.filter(edge => edge.w === w);
    }
    return [];
  }

  nodeEdges(v: string, w:string): EdgeObj[] {
    const inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w))
    }
    return [];
  }

}

function incrementOrInitEntry(map: Count, k: string): void {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map: Count, k: string): void {
  if (!--map[k]) { delete map[k]; }
}

function edgeArgsToId(isDirected: boolean, v_: string, w_: String, name?: string): string {
  let v = "" + v_;
  let w = "" + w_;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (name === undefined ? DEFAULT_EDGE_NAME : name);
}

function edgeArgsToObj(isDirected: boolean, v_: String, w_: string, name?: string): EdgeObj {
  let v = "" + v_;
  let w = "" + w_;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  const edgeObj: EdgeObj = { v: v, w: w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected: boolean, edgeObj: EdgeObj): string {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

export {
  Graph
}
