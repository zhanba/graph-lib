import { Graph } from "../graph";
import { CycleException, topsort } from "./topsort";

function isAcyclic(g: Graph) {
  try {
    topsort(g);
  } catch (e) {
    if (e instanceof CycleException) {
      return false;
    }
    throw e;
  }
  return true;
}

export {isAcyclic};
