import { Graph } from "../graph";
import { dfs, Order } from "./dfs";

function postorder(g: Graph, vs: string | string[]) {
  return dfs(g, vs, Order.post);
}

export {postorder};
