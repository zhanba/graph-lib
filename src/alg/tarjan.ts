import { Graph } from "../graph";

function tarjan(g: Graph): string[][] {
  let index = 0;
  const stack: string[] = [];
  // node id -> { onStack, lowlink, index }
  const visited: {} = {};
  const results: string[][] = [];

  function dfs(v: string) {
    const entry = visited[v] = {
      index: index++,
      lowLink: index,
      onStack: true,
    };
    stack.push(v);

    g.successors(v).forEach((w) => {
      if (!Reflect.has(visited, w)) {
        dfs(w);
        entry.lowLink = Math.min(entry.lowLink, visited[w].lowlink);
      } else if (visited[w].onStack) {
        entry.lowLink = Math.min(entry.lowLink, visited[w].index);
      }
    });

    if (entry.lowLink === entry.index) {
      const cmpt: string[] = [];
      let w;
      do {
        w = stack.pop();
        visited[w].onStack = false;
        cmpt.push(w);
      } while (v !== w);
      results.push(cmpt);
    }
  }

  g.nodes().forEach((v) => {
    if (!Reflect.has(visited, v)) {
      dfs(v);
    }
  });

  return results;
}

export { tarjan };
