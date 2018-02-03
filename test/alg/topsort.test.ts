import * as _ from "lodash";
import { CycleException, topsort } from "../../src/alg/topsort";
import { Graph } from "../../src/graph";

describe("alg.topsort", () => {
  it("returns an empty array for an empty graph", () => {
    expect(topsort(new Graph())).toHaveLength(0);
  });

  it("sorts nodes such that earlier nodes have directed edges to later nodes", () => {
    const g = new Graph();
    g.setPath(["b", "c", "a"]);
    expect(topsort(g)).toEqual(["b", "c", "a"]);
  });

  it("works for a diamond", () => {
    const g = new Graph();
    g.setPath(["a", "b", "d"]);
    g.setPath(["a", "c", "d"]);

    const result = topsort(g);
    expect(_.indexOf(result, "a")).toBe(0);
    expect(_.indexOf(result, "b")).toBeLessThan(_.indexOf(result, "d"));
    expect(_.indexOf(result, "c")).toBeLessThan(_.indexOf(result, "d"));
    expect(_.indexOf(result, "d")).toBe(3);
  });

  it("throws CycleException if there is a cycle #1", () => {
    const g = new Graph();
    g.setPath(["b", "c", "a", "b"]);
    expect(() => { topsort(g); }).toThrow(CycleException);
  });

  it("throws CycleException if there is a cycle #2", () => {
    const g = new Graph();
    g.setPath(["b", "c", "a", "b"]);
    g.setEdge("b", "d");
    expect(() => { topsort(g); }).toThrow(CycleException);
  });

  it("throws CycleException if there is a cycle #3", () => {
    const g = new Graph();
    g.setPath(["b", "c", "a", "b"]);
    g.setNode("d");
    expect(() => { topsort(g); }).toThrow(CycleException);
  });
});
