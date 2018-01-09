import { Graph } from "../graph";
import { dfs, Order } from "./dfs";

function preorder(g: Graph, vs: string | string[]) {
  return dfs(g, vs, Order.pre);
}

export {preorder};
