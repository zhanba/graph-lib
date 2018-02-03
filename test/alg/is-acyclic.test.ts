import { isAcyclic } from "../../src/alg/is-acyclic";
import { Graph } from "../../src/graph";

describe("alg.isAcyclic", () => {
  it("returns true if the graph has no cycles", () => {
    const g = new Graph();
    g.setPath(["a", "b", "c"]);
    expect(isAcyclic(g)).toBe(true);
  });

  it("returns false if the graph has at least one cycle", () => {
    const g = new Graph();
    g.setPath(["a", "b", "c", "a"]);
    expect(isAcyclic(g)).toBe(false);
  });

  it("returns false if the graph has a cycle of 1 node", () => {
    const g = new Graph();
    g.setPath(["a", "a"]);
    expect(isAcyclic(g)).toBe(false);
  });

  it("rethrows non-CycleException errors", () => {
    expect(() => { isAcyclic(undefined); }).toThrow();
  });
});
