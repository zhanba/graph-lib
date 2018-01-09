import { Graph } from "../graph";

function topsort(g: Graph) {
  const visited = {};
  const stack = [];
  const results: string[] = [];

  function visit(node: string) {
    if (Reflect.has(stack, node)) {
      throw new CycleException();
    }

    if (!Reflect.has(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      g.predecessors(node).forEach(visit);
      delete stack[node];
      results.push(node);
    }
  }

  g.sinks().forEach(visit);

  if (Object.keys(visited).length !== g.nodeCount()) {
    throw new CycleException();
  }

  return results;
}

// tslint:disable-next-line:no-empty
function CycleException() {}

export { topsort, CycleException };
