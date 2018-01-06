import { Graph } from "../graph";

/*
 * A helper that preforms a pre- or post-order traversal on the input graph
 * and returns the nodes in the order they were visited. If the graph is
 * undirected then this algorithm will navigate using neighbors. If the graph
 * is directed then this algorithm will navigate using successors.
 *
 * Order must be one of "pre" or "post".
 */
enum Order { pre = "pre", post = "post"}

function dfs(g: Graph, vs: string[]|string, order: Order) {
  if (!Array.isArray(vs)) {
    vs = [vs];
  }

  const navigation = (g.directed ? g.successors : g.neighbors).bind(g);

  const acc: string[] = [];
  const visited = {};
  vs.forEach((v) => {
    if (!g.hasNode(v)) {
      throw new Error("Graph does not have node: " + v);
    }

    doDfs(g, v, (order === "post"), visited, navigation, acc);
  });
}

function doDfs(g: Graph, v: string, postOrder: boolean,
               visited: {[v: string]: boolean}, navigation: (v: string) => string[], acc: string[]) {
  if (!Reflect.has(visited, v)) {
    visited[v] = true;

    if (!postOrder) { acc.push(v); }
    navigation(v).forEach((w) => {
      doDfs(g, w, postOrder, visited, navigation, acc);
    });
    if (postOrder) {acc.push(v); }
  }
}

export {dfs};
