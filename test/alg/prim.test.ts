import * as _ from "lodash";
import { prim } from "../../src/alg/prim";
import { Graph } from "../../src/graph";
import { weightFn } from "./util";

describe("alg.prim", () => {
  it("returns an empty graph for an empty input", () => {
    const source = new Graph();

    const g = prim(source, weightFn(source));
    expect(g.nodeCount()).toBe(0);
    expect(g.edgeCount()).toBe(0);
  });

  it("returns a single node graph for a graph with a single node", () => {
    const source = new Graph();
    source.setNode("a");

    const g = prim(source, weightFn(source));
    expect(g.nodes()).toEqual(["a"]);
    expect(g.edgeCount()).toEqual(0);
  });

  it("returns a deterministic result given an optimal solution", () => {
    const source = new Graph();
    source.setEdge("a", "b",  1);
    source.setEdge("b", "c",  2);
    source.setEdge("b", "d",  3);
    // This edge should not be in the min spanning tree
    source.setEdge("c", "d", 20);
    // This edge should not be in the min spanning tree
    source.setEdge("c", "e", 60);
    source.setEdge("d", "e",  1);

    const g = prim(source, weightFn(source));
    expect(_.sortBy(g.neighbors("a"))).toEqual(["b"]);
    expect(_.sortBy(g.neighbors("b"))).toEqual(["a", "c", "d"]);
    expect(_.sortBy(g.neighbors("c"))).toEqual(["b"]);
    expect(_.sortBy(g.neighbors("d"))).toEqual(["b", "e"]);
    expect(_.sortBy(g.neighbors("e"))).toEqual(["d"]);
  });

  it("throws an Error for unconnected graphs", () => {
    const source = new Graph();
    source.setNode("a");
    source.setNode("b");

    expect(() => { prim(source, weightFn(source)); }).toThrow();
  });
});
