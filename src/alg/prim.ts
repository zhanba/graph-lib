import { Graph, IEdgeObj } from "../graph";
import { PriortyQueue } from "../priority-queue";
import { IWeightFn } from "./dijkstra";

function prim(g: Graph, weightFunc: IWeightFn) {
  const result = new Graph();
  const parents: { [w: string]: string } = {};
  const pq = new PriortyQueue();
  let v: string;

  function updateNeighbors(edge: IEdgeObj) {
    const w = edge.v === v ? edge.w : edge.v;
    const pri = pq.priority(w);
    if (pri !== undefined) {
      const edgeWeight = weightFunc(edge);
      if (edgeWeight < pri) {
        parents[w] = v;
        pq.decrease(w, edgeWeight);
      }
    }
  }

  if (g.nodeCount() === 0) {
    return result;
  }

  g.nodes().forEach((v2) => {
    pq.add(v2, Number.POSITIVE_INFINITY);
    result.setNode(v2);
  });

  // Start from an arbitrary node
  pq.decrease(g.nodes()[0], 0);

  let init = false;
  while (pq.size() > 0) {
    v = String(pq.removeMin());
    if (Reflect.has(parents, v)) {
      result.setEdge(v, parents[v]);
    } else if (init) {
      throw new Error("Input graph is not connected: " + g);
    } else {
      init = true;
    }
    g.nodeEdges(v).forEach(updateNeighbors);
  }

  return result;
}

export { prim };
