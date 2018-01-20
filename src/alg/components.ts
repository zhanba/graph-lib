import { Graph } from "../graph";

function components(g: Graph) {
  const visited: {[v: string]: boolean} = {};
  let cmpt: string[] = [];
  const cmpts: string[][] = [];
  function dfs(v: string) {
    if (Reflect.has(visited, v)) { return; }
    visited[v] = true;
    cmpt.push(v);
    const succ = g.successors(v);
    if (succ !== undefined) {
      succ.forEach(dfs);
    }
    const pred = g.predecessors(v);
    if (pred !== undefined) {
      pred.forEach(dfs);
    }
  }

  g.nodes().forEach((v) => {
    cmpt = [];
    dfs(v);
    if (cmpt.length) {
      cmpts.push(cmpt);
    }
  });

  return cmpts;
}

export {components};
