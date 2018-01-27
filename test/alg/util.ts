import { Graph, IEdgeObj } from "../../src/graph";

export function weightFn(g: Graph) {
  return (e: IEdgeObj) => Number(g.edge(e)) // cast type for test??
}