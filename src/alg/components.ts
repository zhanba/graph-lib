import { Graph } from "../graph";

function components(g: Graph) {
  const visited: {[v: string]: boolean} = {};
  let cmpt: string[] = [];
  const cmpts: string[][] = [];
  function dfs(v: string) {
    if (Reflect.has(visited, v)) { return; }
    visited[v] = true;
    cmpt.push(v);
    g.successors(v).forEach(dfs);
    g.predecessors(v).forEach(dfs);
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
