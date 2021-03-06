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

const DEFAULT_WEIGHT_FUNC: IWeightFn = () => 1;

function floydWarshall(g: Graph, weightFn?: IWeightFn, edgeFn?: IEdgeFn) {
  return runFloydWarshall(g, weightFn, edgeFn);
}

function runFloydWarshall(g: Graph, weightFn = DEFAULT_WEIGHT_FUNC, edgeFn = (v: string) => g.outEdges(v)) {
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
    const res = edgeFn(v);
    if (res !== undefined) {
      res.forEach((edge) => {
        const w = edge.v === v ? edge.w : edge.v;
        const d = weightFn(edge);
        results[v][w] = { distance: d, predecessor: v };
      });
    }
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
