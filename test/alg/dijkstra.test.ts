import { dijkstra, dijkstraAll } from "../../src/alg/dijkstra";
import { Graph, IEdgeObj } from "../../src/graph";
import * as allShortestPathsTest from "./all-shortest-paths";
import { weightFn } from "./util";

describe("alg.dijkstra", () => {
  it("assigns distance 0 for the source node", () => {
    const g = new Graph();
    g.setNode("source");
    expect(dijkstra(g, "source")).toEqual({ source: { distance: 0 } });
  });

  it("returns Number.POSITIVE_INFINITY for unconnected nodes", () => {
    const g = new Graph();
    g.setNode("a");
    g.setNode("b");
    expect(dijkstra(g, "a")).toEqual({
      a: { distance: 0 },
      b: { distance: Number.POSITIVE_INFINITY },
    });
  });

  it("returns the distance and path from the source node to other nodes", () => {
    const g = new Graph();
    g.setPath(["a", "b", "c"]);
    g.setEdge("b", "d");
    expect(dijkstra(g, "a")).toEqual({
      a: { distance: 0 },
      b: { distance: 1, predecessor: "a" },
      c: { distance: 2, predecessor: "b" },
      d: { distance: 2, predecessor: "b" },
    });
  });

  it("works for undirected graphs", () => {
    const g = new Graph({ directed: false });
    g.setPath(["a", "b", "c"]);
    g.setEdge("b", "d");
    expect(dijkstra(g, "a")).toEqual({
      a: { distance: 0 },
      b: { distance: 1, predecessor: "a" },
      c: { distance: 2, predecessor: "b" },
      d: { distance: 2, predecessor: "b" },
    });
  });

  it("uses an optionally supplied weight function", () => {
    const g = new Graph();
    g.setEdge("a", "b", 1);
    g.setEdge("a", "c", 2);
    g.setEdge("b", "d", 3);
    g.setEdge("c", "d", 3);

    expect(dijkstra(g, "a", weightFn(g))).toEqual({
      a: { distance: 0 },
      b: { distance: 1, predecessor: "a" },
      c: { distance: 2, predecessor: "a" },
      d: { distance: 4, predecessor: "b" },
    });
  });

  it("uses an optionally supplied edge function", () => {
    const g = new Graph();
    g.setPath(["a", "c", "d"]);
    g.setEdge("b", "c");

    expect(dijkstra(g, "d", undefined, (e) => g.inEdges(e))).toEqual({
      a: { distance: 2, predecessor: "c" },
      b: { distance: 2, predecessor: "c" },
      c: { distance: 1, predecessor: "d" },
      d: { distance: 0 },
    });
  });

  it("throws an Error if it encounters a negative edge weight", () => {
    const g = new Graph();
    g.setEdge("a", "b",  1);
    g.setEdge("a", "c", -2);
    g.setEdge("b", "d",  3);
    g.setEdge("c", "d",  3);

    expect(() => { dijkstra(g, "a", weightFn(g)); }).toThrow();
  });
});

describe("alg.dijkstraAll", () => {
  allShortestPathsTest.tests(dijkstraAll);

  it("throws an Error if it encounters a negative edge weight", () => {
    const g = new Graph();
    g.setEdge("a", "b",  1);
    g.setEdge("a", "c", -2);
    g.setEdge("b", "d",  3);
    g.setEdge("c", "d",  3);

    expect(() => { dijkstraAll(g, weightFn(g)); }).toThrow();
  });
});
