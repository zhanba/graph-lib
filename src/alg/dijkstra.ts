import { Graph, IEdgeObj } from "../graph";
import { PriorityQueue } from "../priority-queue";

export interface IEntry {
  [key: string]: number|string;
  distance: number;
}

export interface IDijkstraResult {
  [v: string]: IEntry;
}

export interface IDijkstraAllResult {
  [v: string]: IDijkstraResult;
}

export type IWeightFn = (edge: IEdgeObj) => number;

export type IEdgeFn = (v: string) => IEdgeObj[]|undefined;

const DEFAULT_WEIGHT_FUNC = () => 1;

function dijkstra(g: Graph, source: string, weightFn: IWeightFn = DEFAULT_WEIGHT_FUNC,
                  edgeFn = ((v: string) => g.outEdges(v))): IDijkstraResult {
  return runDijkstra(g, String(source), weightFn, edgeFn);
}

function runDijkstra(g: Graph, source: string,
                     weightFn: IWeightFn,
                     edgeFn: IEdgeFn) {
  const results: IDijkstraResult = {};
  const pq = new PriorityQueue();
  let v: string = "";
  let vEntry: IEntry = {distance: 0};

  const updateNeighbors = (edge: IEdgeObj) => {
    const w = edge.v !== v ? edge.v : edge.w;
    const wEntry: IEntry = results[w];
    const weight = weightFn(edge);
    const distance = vEntry.distance + weight;

    if (weight < 0) {
      throw new Error("dijkstra does not allow negative edge weights. " +
                      "Bad edge: " + edge + " Weight: " + weight);
    }

    if (distance < wEntry.distance) {
      wEntry.distance = distance;
      wEntry.predecessor = v;
      pq.decrease(w, distance);
    }
  };

  g.nodes().forEach((v2) => {
    const distance2 = v2 === source ? 0 : Number.POSITIVE_INFINITY;
    results[v2] = { distance: distance2 };
    pq.add(v2, distance2);
  });

  while (pq.size() > 0) {
    v = pq.removeMin() as string;
    vEntry = results[v];
    if (vEntry.distance === Number.POSITIVE_INFINITY) {
      break;
    }
    const res = edgeFn(v);
    if (res !== undefined) {
      res.forEach(updateNeighbors);
    }
  }

  return results;
}

function dijkstraAll(g: Graph, weightFn: IWeightFn, edgeFn?: IEdgeFn): IDijkstraAllResult {
  const res: IDijkstraAllResult = {};
  g.nodes().forEach((v) => {
    res[v] = dijkstra(g, v, weightFn, edgeFn);
  });
  return res;
}

export { dijkstra, dijkstraAll };
