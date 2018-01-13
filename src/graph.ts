import { isEmpty, isFunction, union } from "lodash";

const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

export type LabelValue =  string | number | boolean | object | undefined;

export interface IGraphConstructor {
  directed?: boolean;
  multigraph?: boolean;
  compound?: boolean;
}

export interface INodes {
  [nodename: string]: LabelValue;
}

export interface ICount {
  [key: string]: number;
}

export interface INodeCount {
  [key: string]: ICount;
}

export interface IEdgeLabels {
  [e: string]: LabelValue;
}

export interface IEdgeObj {
  [key: string]: string | undefined;
  v: string;
  w: string;
  name?: string;
}

export interface IEdgeObjs {
  [e: string]: IEdgeObj;
}

export interface IEdgeObjsObj {
  [v: string]: IEdgeObjs;
}

export interface IParentObjs {
  [v: string]: string;
}

export interface IChildrenObjs {
  [v: string]: {
    [e: string]: boolean,
  };
}

export type IDefaultLabelFn = (v: any) => LabelValue;

export type DefaultEdgeLabelFn = (v: string, w: string, name: string) => LabelValue;

class Graph {
  public readonly directed: boolean;
  public readonly multigraph: boolean;
  public readonly compound: boolean;

  // Defaults to be set when creating a new node
  private defaultNodeLabelFn: IDefaultLabelFn;

  private defaultEdgeLabelFn: DefaultEdgeLabelFn;

  // Label for the graph itself
  private label: LabelValue;

  // v -> label
  private nodesObj: INodes;

  // v -> parent
  private parentObj: IParentObjs;

  // v -> children
  private childrenObj: IChildrenObjs;
  // this._children[GRAPH_NODE] = {};

  // v -> edgeObj
  private in: IEdgeObjsObj;

  // u -> v -> Number
  private preds: INodeCount;

  // v -> edgeObj
  private out: IEdgeObjsObj;

  // v -> w -> Number
  private sucs: INodeCount;

  // e -> edgeObj
  private edgeObjs: IEdgeObjs;

  // e -> label
  private edgeLabels: IEdgeLabels;

  /* Number of nodes in the graph. Should only be changed by the implementation. */
  private nodeCountNumber = 0;

  /* Number of edges in the graph. Should only be changed by the implementation. */
  private edgeCountNumber = 0;

  constructor(opt?: IGraphConstructor) {
    this.directed = (opt && opt.directed) ? opt.directed : true;
    this.multigraph = (opt && opt.multigraph) ? opt.multigraph : false;
    this.compound = (opt && opt.compound) ? opt.compound : false;
  }
  /* === Graph functions ========= */
  public setGraph(label: LabelValue): Graph {
    this.label = label;
    return this;
  }

  public graph(): Graph {
    return this;
  }

  /* === Node functions ========== */
  public setDefaultNodeLabel(newDefault: LabelValue | IDefaultLabelFn): Graph {
    if (typeof newDefault !== "function") {
      this.defaultNodeLabelFn = () => newDefault;
      return this;
    }
    this.defaultNodeLabelFn = newDefault;
    return this;
  }

  public nodeCount(): number {
    return this.nodeCountNumber;
  }

  public nodes(): string[] {
    return Object.keys(this.nodesObj);
  }

  public sources(): string[] {
    return this.nodes().filter((v) => isEmpty(this.in[v]));
  }

  public sinks(): string[] {
    return this.nodes().filter((v) => isEmpty(this.out[v]));
  }

  public setNodes(vs: string[], value?: LabelValue): Graph {
    const args = arguments;
    vs.forEach((v) => {
      if (args.length > 1) {
        this.setNode(v, value);
      } else {
        this.setNode(v);
      }
    });
    return this;
  }

  public setNode(v: string, value?: LabelValue): Graph {
    if (this.hasNode(v)) {
      if (arguments.length > 1) {
        this.nodesObj[v] = value;
      } else {
        throw new Error("missing node value");
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

  public node(v: string) {
    return this.nodesObj[v];
  }

  public hasNode(v: string) {
    return Reflect.has(this.nodesObj, v);
  }

  public removeNode(v: string): Graph {
    if (this.hasNode(v)) {
      const removeEdge = (e: string) => {this.removeEdge(this.edgeObjs[e]); };
      delete this.nodesObj[v];
      if (this.compound) {
        this.removeFromParentsChildList(v);
        delete this.parentObj[v];
        this.children(v).forEach((child) => this.setParent(child));
        delete this.childrenObj[v];
      }

      Object.keys(this.in[v]).forEach(removeEdge);
      delete this.in[v];
      delete this.preds[v];
      Object.keys(this.out[v]).forEach(removeEdge);
      delete this.out[v];
      delete this.sucs[v];
      --this.nodeCountNumber;
    }
    return this;
  }

  public setParent(v: string, parent?: string): Graph {
    if (!this.compound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }

    if (parent === undefined) {
      parent = GRAPH_NODE;
    } else {
      // Coerce parent to string
      parent += "";
      for (let ancestor: string|undefined = parent; ancestor !== undefined; ancestor = this.parent(ancestor)) {
        if (ancestor === v) {
          throw new Error(`Setting ${parent} as parent of ${v} would create a cycle`);
        }
      }
      this.setNode(parent);
    }

    this.setNode(v);
    this.removeFromParentsChildList(v);
    this.parentObj[v] = parent;
    this.childrenObj[parent][v] = true;

    return this;
  }

  public removeFromParentsChildList(v: string) {
    delete this.childrenObj[this.parentObj[v]][v];
  }

  public parent(v: string): string|undefined {
    if (this.compound) {
      const parent = this.parentObj[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }

  public children(v = GRAPH_NODE): string[] {
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

  public predecessors(v: string): string[] {
    const predsV = this.preds[v];
    if (predsV) {
      return Object.keys(predsV);
    }
    return [];
  }

  public successors(v: string): string[] {
    const sucsV = this.sucs[v];
    if (sucsV) {
      return Object.keys(sucsV);
    }
    return [];
  }

  public neighbors(v: string): string[] {
    const preds = this.predecessors(v);
    const sucs = this.successors(v);
    if (preds) {
      return union(preds, sucs);
    }
    return [];
  }

  public isLeaf(v: string): boolean {
    let neighbors;
    if (this.directed) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    return neighbors.length === 0;
  }

  public filterNodes(filter: (v: string) => boolean): Graph {
    const copy = new Graph({
      compound: this.compound,
      directed: this.directed,
      multigraph: this.multigraph,
    });

    copy.setGraph(this.graph());

    for (const [v, value] of Object.entries(this.nodesObj)) {
      if (filter(v)) {
        copy.setNode(v, value);
      }
    }

    for (const [v, edgeObject] of Object.entries(this.edgeObjs)) {
      if (copy.hasNode(edgeObject.v) && copy.hasNode(edgeObject.w)) {
        copy.setEdge(edgeObject, this.edge(edgeObject));
      }
    }

    const self = this;
    const parents: { [v: string]: string|undefined } = {};
    function findParent(v: string): string|undefined {
      const parent = self.parent(v);
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    }

    if (this.compound) {
      copy.nodes().forEach((v) => copy.setParent(v, findParent(v)));
    }
    return copy;
  }

  /* === Edge functions ========== */
  public setDefaultEdgeLabel(newDefault: LabelValue | IDefaultLabelFn) {
    if (typeof newDefault !== "function") {
      this.defaultEdgeLabelFn = () => newDefault;
    } else {
      this.defaultEdgeLabelFn = newDefault;
    }
    return this;
  }

  public edgeCount(): number {
    return this.edgeCountNumber;
  }

  public edges(): IEdgeObj[] {
    return Object.values(this.edgeObjs);
  }

  public setPath(vs: string[], value?: LabelValue): Graph {
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
  public setEdge(edgeobj: IEdgeObj, value?: LabelValue): Graph;
  public setEdge(v: string, w: string, value?: LabelValue, name?: string): Graph;
  public setEdge(x: any): any {
    let v;
    let w;
    let name;
    let value;
    let valueSpecified = false;
    const arg0 = arguments[0];

    if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
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

    v = "" + v;
    w = "" + w;
    if (name !== undefined) {
      name = "" + name;
    }

    const e = edgeArgsToId(this.directed, v, w, name);
    if (Reflect.has(this.edgeLabels, e)) {
      if (valueSpecified) {
        this.edgeLabels[e] = value;
      }
      return this;
    }

    if (name !== undefined && !this.multigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
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

  public edge(v: string, w: string, name?: string): LabelValue;
  public edge(edgeObj: IEdgeObj): LabelValue;
  public edge(v: any): any {
    const e = arguments.length === 1
      ? edgeObjToId(this.directed, arguments[0])
      : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    return this.edgeLabels[e];
  }

  public hasEdge(v: string, w: string, name?: string): boolean;
  public hasEdge(edgeObj: IEdgeObj): boolean;
  public hasEdge(v: any): any {
    const e = arguments.length === 1
      ? edgeObjToId(this.directed, arguments[0])
      : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    return Reflect.has(this.edgeLabels, e);
  }

  public removeEdge(v: string, w: string, name?: string): Graph;
  public removeEdge(edgeObj: IEdgeObj): Graph;
  public removeEdge(v: any): any {
    const e = arguments.length === 1
      ? edgeObjToId(this.directed, arguments[0])
      : edgeArgsToId(this.directed, v, arguments[1], arguments[2]);
    const edge = this.edgeObjs[e];
    if (edge) {
      const v1 = edge.v;
      const w1 = edge.w;
      delete this.edgeLabels[e];
      delete this.edgeObjs[e];
      decrementOrRemoveEntry(this.preds[w1], v1);
      decrementOrRemoveEntry(this.sucs[v1], w1);
      delete this.in[w1][e];
      delete this.out[v1][e];
      this.edgeCountNumber--;
    }
    return this;
  }

  public inEdges(v: string, u?: string): IEdgeObj[] {
    const inV = this.in[v];
    if (inV) {
      const edges = Object.values(inV);
      if (!u) {
        return edges;
      }
      return edges.filter((edge) => edge.v === u);
    }
    return [];
  }

  public outEdges(v: string, w?: string): IEdgeObj[] {
    const outV = this.out[v];
    if (outV) {
      const edges = Object.values(outV);
      if (!w) {
        return edges;
      }
      return edges.filter((edge) => edge.w === w);
    }
    return [];
  }

  public nodeEdges(v: string, w?: string): IEdgeObj[] {
    const inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w));
    }
    return [];
  }

}

function incrementOrInitEntry(map: ICount, k: string): void {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map: ICount, k: string): void {
  if (!--map[k]) { delete map[k]; }
}

function edgeArgsToId(isDirected: boolean, v0: string, w0: string, name?: string): string {
  let v = "" + v0;
  let w = "" + w0;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (name === undefined ? DEFAULT_EDGE_NAME : name);
}

function edgeArgsToObj(isDirected: boolean, v0: string, w0: string, name?: string): IEdgeObj {
  let v = "" + v0;
  let w = "" + w0;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  const edgeObj: IEdgeObj = { v, w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected: boolean, edgeObj: IEdgeObj): string {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

export {
  Graph,
};
