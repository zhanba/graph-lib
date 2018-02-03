import * as _ from "lodash";
import { findCycles } from "../../src/alg/find-cycles";
import { Graph } from "../../src/graph";
import { sort } from "./util";

describe("alg.findCycles", () => {
  it("returns an empty array for an empty graph", () => {
    expect(findCycles(new Graph())).toEqual([]);
  });

  it("returns an empty array if the graph has no cycles", () => {
    const g = new Graph();
    g.setPath(["a", "b", "c"]);
    expect(findCycles(g)).toEqual([]);
  });

  it("returns a single entry for a cycle of 1 node", () => {
    const g = new Graph();
    g.setPath(["a", "a"]);
    expect(sort(findCycles(g))).toEqual([["a"]]);
  });

  it("returns a single entry for a cycle of 2 nodes", () => {
    const g = new Graph();
    g.setPath(["a", "b", "a"]);
    expect(sort(findCycles(g))).toEqual([["a", "b"]]);
  });

  it("returns a single entry for a triangle", () => {
    const g = new Graph();
    g.setPath(["a", "b", "c", "a"]);
    expect(sort(findCycles(g))).toEqual([["a", "b", "c"]]);
  });

  it("returns multiple entries for multiple cycles", () => {
    const g = new Graph();
    g.setPath(["a", "b", "a"]);
    g.setPath(["c", "d", "e", "c"]);
    g.setPath(["f", "g", "g"]);
    g.setNode("h");
    expect(sort(findCycles(g))).toEqual([["a", "b"], ["c", "d", "e"], ["g"]]);
  });
});
