import { Graph } from "../graph";
import { IEdgeFn, IWeightFn } from "./dijkstra";

export interface IResult {
  [v: string]: {
    [v: string]: {
      distance: number;
      predecessor?: string;
    };
  };
}

const DEFAULT_WEIGHT_FUNC = () => 1;

function floydWarshall(g: Graph, weighFn: IWeightFn, edgeFn: IEdgeFn) {
  return runFloydWarshall(g, weighFn = DEFAULT_WEIGHT_FUNC, edgeFn = (v) => g.outEdges(v));
}

function runFloydWarshall(g: Graph, weighFn: IWeightFn, edgeFn: IEdgeFn) {
  const results: IResult = {};
  const nodes = g.nodes();

  nodes.forEach((v) => {
    results[v] = {};
    results[v][v] = { distance: 0 };
    nodes.forEach((w) => {
      if (v !== w) {
        results[v][w] = { distance: Number.POSITIVE_INFINITY };
      }
    });

    edgeFn(v).forEach((edge) => {
      const w = edge.v === v ? edge.w : edge.v;
      const d = weighFn(edge);
      results[v][w] = { distance: d, predecessor: v };
    });
  });

  nodes.forEach((k) => {
    const rowK = results[k];
    nodes.forEach((i) => {
      const rowI = results[i];
      nodes.forEach((j) => {
        const ik = rowI[k];
        const kj = rowK[j];
        const ij = rowI[j];
        const altDistance = ik.distance + kj.distance;
        if (altDistance < ij.distance) {
          ij.distance = altDistance;
          ij.predecessor = kj.predecessor;
        }
      });
    });
  });

  return results;
}

export { floydWarshall };
