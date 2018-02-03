import * as _ from "lodash";
import { Graph, IEdgeObj } from "../../src/graph";

export function weightFn(g: Graph) {
  return (e: IEdgeObj) => Number(g.edge(e)); // cast type for test??
}

// A helper that sorts components and their contents
export function sort(cmpts) {
  return _.sortBy(_.map(cmpts, (cmpt) => _.sortBy(cmpt)), (cmpts2) => cmpts2[0]);
}
