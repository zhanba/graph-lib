import * as _ from "lodash";
import { postorder } from "../../src/alg/postorder";
import { Graph } from "../../src/graph";

describe("alg.postorder", () => {
  it("returns the root for a singleton graph", () => {
    const g = new Graph();
    g.setNode("a");
    expect(postorder(g, "a")).toEqual(["a"]);
  });

  it("visits each node in the graph once", () => {
    const g = new Graph();
    g.setPath(["a", "b", "d", "e"]);
    g.setPath(["a", "c", "d", "e"]);

    const nodes = postorder(g, "a");
    expect(_.sortBy(nodes)).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("works for a tree", () => {
    const g = new Graph();
    g.setEdge("a", "b");
    g.setPath(["a", "c", "d"]);
    g.setEdge("c", "e");

    const nodes = postorder(g, "a");
    expect(_.sortBy(nodes)).toEqual(["a", "b", "c", "d", "e"]);
    expect(nodes.indexOf("b")).toBeLessThan(nodes.indexOf("a"));
    expect(nodes.indexOf("c")).toBeLessThan(nodes.indexOf("a"));
    expect(nodes.indexOf("d")).toBeLessThan(nodes.indexOf("c"));
    expect(nodes.indexOf("e")).toBeLessThan(nodes.indexOf("c"));
  });

  it("works for an array of roots", () => {
    const g = new Graph();
    g.setEdge("a", "b");
    g.setEdge("c", "d");
    g.setNode("e");
    g.setNode("f");

    const nodes = postorder(g, ["a", "b", "c", "e"]);
    expect(_.sortBy(nodes)).toEqual(["a", "b", "c", "d", "e"]);
    expect(nodes.indexOf("b")).toBeLessThan(nodes.indexOf("a"));
    expect(nodes.indexOf("d")).toBeLessThan(nodes.indexOf("c"));
  });

  it("works for multiple connected roots", () => {
    const g = new Graph();
    g.setEdge("a", "b");
    g.setEdge("a", "c");
    g.setEdge("d", "c");

    const nodes = postorder(g, ["a", "d"]);
    expect(_.sortBy(nodes)).toEqual(["a", "b", "c", "d"]);
    expect(nodes.indexOf("b")).toBeLessThan(nodes.indexOf("a"));
    expect(nodes.indexOf("c")).toBeLessThan(nodes.indexOf("a"));
    expect(nodes.indexOf("c")).toBeLessThan(nodes.indexOf("d"));
  });

  it("fails if root is not in the graph", () => {
    const g = new Graph();
    g.setNode("a");
    expect(() => { postorder(g, "b"); }).toThrow();
  });
});
