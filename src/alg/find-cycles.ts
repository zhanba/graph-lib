import { Graph } from "../graph";
import { tarjan } from "./tarjan";

function findCycles(g: Graph) {
  return tarjan(g).filter((cmpt) => {
    return cmpt.length > 1 || (cmpt.length === 1 && g.hasEdge(cmpt[0], cmpt[0]));
  });
}

export { findCycles };
