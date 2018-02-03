import { Graph, IEdgeObj } from "../graph";
import { components } from "./components";
import { dfs, Order } from "./dfs";
import { dijkstra, dijkstraAll, IDijkstraAllResult, IDijkstraResult } from "./dijkstra";
import { findCycles } from "./find-cycles";
import { floydWarshall, IResult } from "./floyd-warshall";
import { isAcyclic } from "./is-acyclic";
import { postorder } from "./postorder";
import { preorder } from "./preorder";
import { prim } from "./prim";
import { tarjan } from "./tarjan";
import { topsort } from "./topsort";

const alg = {
  components,
  dfs,
  dijkstra,
  dijkstraAll,
  findCycles,
  floydWarshall,
  isAcyclic,
  postorder,
  preorder,
  prim,
  tarjan,
  topsort,
};

export { alg };
