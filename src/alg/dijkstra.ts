import { Graph } from "../graph";
import { PriortyQueue } from "../priority-queue";

const DEFAULT_WEIGHT_FUNC = () => 1;

function dijkstra(g: Graph, source: string, weightFn = DEFAULT_WEIGHT_FUNC, 
                  edgeFn = ((v) => g.outEdges(v))) {
  return runDijkstra(g, String(source), weightFn, edgeFn);
}

function runDijkstra(g: Graph, source: string, weightFn, edgeFn) {
  const results = {};
  const pq = new PriortyQueue();
  const v;
  const vEntry;

  const updateNeighbors = function(edge) {
    
  }
}