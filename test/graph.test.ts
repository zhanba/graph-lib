import * as _ from "lodash";
import { Graph } from "../src/graph";

describe("Graph", () => {
  let g: Graph;

  beforeEach(() => {
    g = new Graph();
  });

  describe("initial state", () => {
    test("has no nodes", () => {
      expect(g.nodeCount()).toBe(0);
    });

    test("has no edges", () => {
      expect(g.edgeCount()).toBe(0);
    });

    test("has no attributes", () => {
      expect(g.graph()).toBeUndefined();
    });

    test("defaults to a simple directed graph", () => {
      expect(g.directed).toBe(true);
      expect(g.compound).toBe(false);
      expect(g.multigraph).toBe(false);
    });

    test("can be set to undirected", () => {
      const g2 = new Graph({ directed: false });
      expect(g2.directed).toBe(false);
      expect(g2.compound).toBe(false);
      expect(g2.multigraph).toBe(false);
    });

    test("can be set to a compound graph", () => {
      const g2 = new Graph({ compound: true });
      expect(g2.directed).toBe(true);
      expect(g2.compound).toBe(true);
      expect(g2.multigraph).toBe(false);
    });

    test("can be set to a.multigraph", () => {
      const g2 = new Graph({ multigraph: true });
      expect(g2.directed).toBe(true);
      expect(g2.compound).toBe(false);
      expect(g2.multigraph).toBe(true);
    });
  });

  describe("setGraph", () => {
    test("can be used to get and set properties for the graph", () => {
      g.setGraph("foo");
      expect(g.graph()).toBe("foo");
    });

    test("is chainable", () => {
      expect(g.setGraph("foo")).toBe(g);
    });
  });

  describe("nodes", () => {
    test("is empty if there are no nodes in the graph", () => {
      expect(g.nodes()).toEqual([]);
    });

    test("returns the ids of nodes in the graph", () => {
      g.setNode("a");
      g.setNode("b");
      expect(_.sortBy(g.nodes())).toEqual(["a", "b"]);
    });
  });

  describe("sources", () => {
    test("returns nodes in the graph that have no in-edges", () => {
      g.setPath(["a", "b", "c"]);
      g.setNode("d");
      expect(_.sortBy(g.sources())).toEqual(["a", "d"]);
    });
  });

  describe("sinks", () => {
    test("returns nodes in the graph that have no out-edges", () => {
      g.setPath(["a", "b", "c"]);
      g.setNode("d");
      expect(_.sortBy(g.sinks())).toEqual(["c", "d"]);
    });
  });

  describe("filterNodes", () => {
    test("returns an identical graph when the filter selects everything", () => {
      g.setGraph("graph label");
      g.setNode("a", 123);
      g.setPath(["a", "b", "c"]);
      g.setEdge("a", "c", 456);
      const g2 = g.filterNodes(() => true);
      expect(_.sortBy(g2.nodes())).toEqual(["a", "b", "c"]);
      expect(_.sortBy(g2.successors("a"))).toEqual(["b", "c"]);
      expect(_.sortBy(g2.successors("b"))).toEqual(["c"]);
      expect(g2.node("a")).toEqual(123);
      expect(g2.edge("a", "c")).toEqual(456);
      expect(g2.graph()).toEqual("graph label");
    });

    test("returns an empty graph when the filter selects nothing", () => {
      g.setPath(["a", "b", "c"]);
      const g2 = g.filterNodes(() => false);
      expect(g2.nodes()).toEqual([]);
      expect(g2.edges()).toEqual([]);
    });

    test("only includes nodes for which the filter returns true", () => {
      g.setNodes(["a", "b"]);
      const g2 = g.filterNodes((v) => v === "a");
      expect(g2.nodes()).toEqual(["a"]);
    });

    test("removes edges that are connected to removed nodes", () => {
      g.setEdge("a", "b");
      const g2 = g.filterNodes((v) => v === "a");
      expect(_.sortBy(g2.nodes())).toEqual(["a"]);
      expect(g2.edges()).toEqual([]);
    });

    test("preserves the directed option", () => {
      const g2 = new Graph({ directed: true });
      expect(g2.filterNodes(() => true).directed).toBe(true);

      const g3 = new Graph({ directed: false });
      expect(g3.filterNodes(() => true).directed).toBe(false);
    });

    test("preserves the multigraph option", () => {
      const g2 = new Graph({ multigraph: true });
      expect(g2.filterNodes(() => true).multigraph).toBe(true);

      const g3 = new Graph({ multigraph: false });
      expect(g3.filterNodes(() => true).multigraph).toBe(false);
    });

    test("preserves the compound option", () => {
      const g2 = new Graph({ compound: true });
      expect(g2.filterNodes(() => true).compound).toBe(true);

      const g3 = new Graph({ compound: false });
      expect(g3.filterNodes(() => true).compound).toBe(false);
    });

    test("includes subgraphs", () => {
      const g2 = new Graph({ compound: true });
      g2.setParent("a", "parent");

      const g3 = g2.filterNodes(() => true);
      expect(g3.parent("a")).toEqual("parent");
    });

    test("includes multi-level subgraphs", () => {
      const g2 = new Graph({ compound: true });
      g2.setParent("a", "parent");
      g2.setParent("parent", "root");

      const g3 = g2.filterNodes(() => true);
      expect(g3.parent("a")).toEqual("parent");
      expect(g3.parent("parent")).toEqual("root");
    });

    test("promotes a node to a higher subgraph if its parent is not included", () => {
      const g2 = new Graph({ compound: true });
      g2.setParent("a", "parent");
      g2.setParent("parent", "root");

      const g3 = g2.filterNodes((v) => v !== "parent");
      expect(g3.parent("a")).toEqual("root");
    });
  });

  describe("setNodes", () => {
    test("creates multiple nodes", () => {
      g.setNodes(["a", "b", "c"]);
      expect(g.hasNode("a")).toBe(true);
      expect(g.hasNode("b")).toBe(true);
      expect(g.hasNode("c")).toBe(true);
    });

    test("can set a value for all of the nodes", () => {
      g.setNodes(["a", "b", "c"], "foo");
      expect(g.node("a")).toBe("foo");
      expect(g.node("b")).toBe("foo");
      expect(g.node("c")).toBe("foo");
    });

    test("is chainable", () => {
      expect(g.setNodes(["a", "b", "c"])).toBe(g);
    });
  });

  describe("setNode", () => {
    test("creates the node if it isn't part of the graph", () => {
      g.setNode("a");
      expect(g.hasNode("a")).toBe(true);
      expect(g.node("a")).toBeUndefined();
      expect(g.nodeCount()).toBe(1);
    });

    test("can set a value for the node", () => {
      g.setNode("a", "foo");
      expect(g.node("a")).toBe("foo");
    });

    test("does not change the node's value with a 1-arg invocation", () => {
      g.setNode("a", "foo");
      g.setNode("a");
      expect(g.node("a")).toBe("foo");
    });

    test("can remove the node's value by passing undefined", () => {
      g.setNode("a", undefined);
      expect(g.node("a")).toBeUndefined();
    });

    test("is idempotent", () => {
      g.setNode("a", "foo");
      g.setNode("a", "foo");
      expect(g.node("a")).toBe("foo");
      expect(g.nodeCount()).toBe(1);
    });

    test("uses the stringified form of the id", () => {
      g.setNode(1);
      expect(g.hasNode(1)).toBe(true);
      expect(g.hasNode("1")).toBe(true);
      expect(g.nodes()).toEqual(["1"]);
    });

    test("is chainable", () => {
      expect(g.setNode("a")).toBe(g);
    });
  });

  describe("setNodeDefaults", () => {
    test("sets a default label for new nodes", () => {
      g.setDefaultNodeLabel("foo");
      g.setNode("a");
      expect(g.node("a")).toBe("foo");
    });

    test("does not change existing nodes", () => {
      g.setNode("a");
      g.setDefaultNodeLabel("foo");
      expect(g.node("a")).toBeUndefined();
    });

    test("is not used if an explicit value is set", () => {
      g.setDefaultNodeLabel("foo");
      g.setNode("a", "bar");
      expect(g.node("a")).toBe("bar");
    });

    test("can take a function", () => {
      g.setDefaultNodeLabel(() => "foo");
      g.setNode("a");
      expect(g.node("a")).toBe("foo");
    });

    test("can take a function that takes the node's name", () => {
      g.setDefaultNodeLabel((v) => v + "-foo");
      g.setNode("a");
      expect(g.node("a")).toBe("a-foo");
    });

    test("is chainable", () => {
      expect(g.setDefaultNodeLabel("foo")).toBe(g);
    });
  });

  describe("node", () => {
    test("returns undefined if the node isn't part of the graph", () => {
      expect(g.node("a")).toBeUndefined();
    });

    test("returns the value of the node if it is part of the graph", () => {
      g.setNode("a", "foo");
      expect(g.node("a")).toBe("foo");
    });
  });

  describe("removeNode", () => {
    test("does nothing if the node is not in the graph", () => {
      expect(g.nodeCount()).toBe(0);
      g.removeNode("a");
      expect(g.hasNode("a")).toBe(false);
      expect(g.nodeCount()).toBe(0);
    });

    test("removes the node if it is in the graph", () => {
      g.setNode("a");
      g.removeNode("a");
      expect(g.hasNode("a")).toBe(false);
      expect(g.nodeCount()).toBe(0);
    });

    test("is idempotent", () => {
      g.setNode("a");
      g.removeNode("a");
      g.removeNode("a");
      expect(g.hasNode("a")).toBe(false);
      expect(g.nodeCount()).toBe(0);
    });

    test("removes edges incident on the node", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      g.removeNode("b");
      expect(g.edgeCount()).toBe(0);
    });

    test("removes parent / child relationships for the node", () => {
      const g2 = new Graph({ compound: true });
      g2.setParent("c", "b");
      g2.setParent("b", "a");
      g2.removeNode("b");
      expect(g2.parent("b")).toBeUndefined();
      expect(g2.children("b")).toBeUndefined();
      expect(g2.children("a")).not.toContainEqual("b");
      expect(g2.parent("c")).toBeUndefined();
    });

    test("is chainable", () => {
      expect(g.removeNode("a")).toBe(g);
    });
  });

  describe("setParent", () => {
    beforeEach(() => {
      g = new Graph({ compound: true });
    });

    test("throws if the graph is not compound", () => {
      expect(() => { new Graph().setParent("a", "parent"); }).toThrow();
    });

    test("creates the parent if it does not exist", () => {
      g.setNode("a");
      g.setParent("a", "parent");
      expect(g.hasNode("parent")).toBe(true);
      expect(g.parent("a")).toBe("parent");
    });

    test("creates the child if it does not exist", () => {
      g.setNode("parent");
      g.setParent("a", "parent");
      expect(g.hasNode("a")).toBe(true);
      expect(g.parent("a")).toBe("parent");
    });

    test("has the parent as undefined if it has never been invoked", () => {
      g.setNode("a");
      expect(g.parent("a")).toBeUndefined();
    });

    test("moves the node from the previous parent", () => {
      g.setParent("a", "parent");
      g.setParent("a", "parent2");
      expect(g.parent("a")).toBe("parent2");
      expect(g.children("parent")).toEqual([]);
      expect(g.children("parent2")).toEqual(["a"]);
    });

    test("removes the parent if the parent is undefined", () => {
      g.setParent("a", "parent");
      g.setParent("a", undefined);
      expect(g.parent("a")).toBeUndefined();
      expect(_.sortBy(g.children())).toEqual(["a", "parent"]);
    });

    test("removes the parent if no parent was specified", () => {
      g.setParent("a", "parent");
      g.setParent("a");
      expect(g.parent("a")).toBeUndefined();
      expect(_.sortBy(g.children())).toEqual(["a", "parent"]);
    });

    test("is idempotent to remove a parent", () => {
      g.setParent("a", "parent");
      g.setParent("a");
      g.setParent("a");
      expect(g.parent("a")).toBeUndefined();
      expect(_.sortBy(g.children())).toEqual(["a", "parent"]);
    });

    test("uses the stringified form of the id", () => {
      g.setParent(2, 1);
      g.setParent(3, 2);
      expect(g.parent(2)).toEqual("1");
      expect(g.parent("2")).toEqual("1");
      expect(g.parent(3)).toEqual("2");
    });

    test("preserves the tree inconstiant", () => {
      g.setParent("c", "b");
      g.setParent("b", "a");
      expect(() => { g.setParent("a", "c"); }).toThrow();
    });

    test("is chainable", () => {
      expect(g.setParent("a", "parent")).toBe(g);
    });
  });

  describe("parent", () => {
    beforeEach(() => {
      g = new Graph({ compound: true });
    });

    test("returns undefined if the graph is not compound", () => {
      expect(new Graph({ compound: false }).parent("a")).toBeUndefined();
    });

    test("returns undefined if the node is not in the graph", () => {
      expect(g.parent("a")).toBeUndefined();
    });

    test("defaults to undefined for new nodes", () => {
      g.setNode("a");
      expect(g.parent("a")).toBeUndefined();
    });

    test("returns the current parent assignment", () => {
      g.setNode("a");
      g.setNode("parent");
      g.setParent("a", "parent");
      expect(g.parent("a")).toBe("parent");
    });
  });

  describe("children", () => {
    beforeEach(() => {
      g = new Graph({ compound: true });
    });

    test("returns undefined if the node is not in the graph", () => {
      expect(g.children("a")).toBeUndefined();
    });

    test("defaults to en empty list for new nodes", () => {
      g.setNode("a");
      expect(g.children("a")).toEqual([]);
    });

    test("returns undefined for a non-compound graph without the node", () => {
      const g2 = new Graph();
      expect(g2.children("a")).toBeUndefined();
    });

    test("returns an empty list for a non-compound graph with the node", () => {
      const g2 = new Graph();
      g2.setNode("a");
      expect(g2.children("a")).toEqual([]);
    });

    it ("returns all nodes for the root of a non-compound graph", () => {
      const g2 = new Graph();
      g2.setNode("a");
      g2.setNode("b");
      expect(_.sortBy(g2.children())).toEqual(["a", "b"]);
    });

    test("returns children for the node", () => {
      g.setParent("a", "parent");
      g.setParent("b", "parent");
      expect(_.sortBy(g.children("parent"))).toEqual(["a", "b"]);
    });

    test("returns all nodes without a parent when the parent is not set", () => {
      g.setNode("a");
      g.setNode("b");
      g.setNode("c");
      g.setNode("parent");
      g.setParent("a", "parent");
      expect(_.sortBy(g.children())).toEqual(["b", "c", "parent"]);
      expect(_.sortBy(g.children(undefined))).toEqual(["b", "c", "parent"]);
    });
  });

  describe("predecessors", () => {
    test("returns undefined for a node that is not in the graph", () => {
      expect(g.predecessors("a")).toBeUndefined();
    });

    test("returns the predecessors of a node", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      g.setEdge("a", "a");
      expect(_.sortBy(g.predecessors("a"))).toEqual(["a"]);
      expect(_.sortBy(g.predecessors("b"))).toEqual(["a"]);
      expect(_.sortBy(g.predecessors("c"))).toEqual(["b"]);
    });
  });

  describe("successors", () => {
    test("returns undefined for a node that is not in the graph", () => {
      expect(g.successors("a")).toBeUndefined();
    });

    test("returns the successors of a node", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      g.setEdge("a", "a");
      expect(_.sortBy(g.successors("a"))).toEqual(["a", "b"]);
      expect(_.sortBy(g.successors("b"))).toEqual(["c"]);
      expect(_.sortBy(g.successors("c"))).toEqual([]);
    });
  });

  describe("neighbors", () => {
    test("returns undefined for a node that is not in the graph", () => {
      expect(g.neighbors("a")).toBeUndefined();
    });

    test("returns the neighbors of a node", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      g.setEdge("a", "a");
      expect(_.sortBy(g.neighbors("a"))).toEqual(["a", "b"]);
      expect(_.sortBy(g.neighbors("b"))).toEqual(["a", "c"]);
      expect(_.sortBy(g.neighbors("c"))).toEqual(["b"]);
    });
  });

  describe("isLeaf", () => {
    test("returns false for connected node in undirected graph", () => {
      g = new Graph({directed: false});
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");
      expect(g.isLeaf("b")).toBe(false);
    });
    test("returns true for an unconnected node in undirected graph", () => {
      g = new Graph({directed: false});
      g.setNode("a");
      expect(g.isLeaf("a")).toBe(true);
    });
    test("returns true for unconnected node in directed graph", () => {
      g.setNode("a");
      expect(g.isLeaf("a")).toBe(true);
    });
    test("returns false for predecessor node in directed graph", () => {
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");
      expect(g.isLeaf("a")).toBe(false);
    });
    test("returns true for successor node in directed graph", () => {
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");
      expect(g.isLeaf("b")).toBe(true);
    });
  });

  describe("edges", () => {
    test("is empty if there are no edges in the graph", () => {
      expect(g.edges()).toEqual([]);
    });

    test("returns the keys for edges in the graph", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      expect(_.sortBy(g.edges(), ["v", "w"])).toEqual([
        { v: "a", w: "b" },
        { v: "b", w: "c" },
      ]);
    });
  });

  describe("setPath", () => {
    test("creates a path of mutiple edges", () => {
      g.setPath(["a", "b", "c"]);
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(g.hasEdge("b", "c")).toBe(true);
    });

    test("can set a value for all of the edges", () => {
      g.setPath(["a", "b", "c"], "foo");
      expect(g.edge("a", "b")).toBe("foo");
      expect(g.edge("b", "c")).toBe("foo");
    });

    test("is chainable", () => {
      expect(g.setPath(["a", "b", "c"])).toBe(g);
    });
  });

  describe("setEdge", () => {
    test("creates the edge if it isn't part of the graph", () => {
      g.setNode("a");
      g.setNode("b");
      g.setEdge("a", "b");
      expect(g.edge("a", "b")).toBeUndefined();
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(g.hasEdge({ v: "a", w: "b" })).toBe(true);
      expect(g.edgeCount()).toBe(1);
    });

    test("creates the nodes for the edge if they are not part of the graph", () => {
      g.setEdge("a", "b");
      expect(g.hasNode("a")).toBe(true);
      expect(g.hasNode("b")).toBe(true);
      expect(g.nodeCount()).toBe(2);
    });

    test("creates a multi-edge if if it isn't part of the graph", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b", undefined, "name");
      expect(g2.hasEdge("a", "b")).toBe(false);
      expect(g2.hasEdge("a", "b", "name")).toBe(true);
    });

    test("throws if a multi-edge is used with a non-multigraph", () => {
      expect(() => { g.setEdge("a", "b", undefined, "name"); }).toThrow();
    });

    test("changes the value for an edge if it is already in the graph", () => {
      g.setEdge("a", "b", "foo");
      g.setEdge("a", "b", "bar");
      expect(g.edge("a", "b")).toBe("bar");
    });

    it ("deletes the value for the edge if the value arg is undefined", () => {
      g.setEdge("a", "b", "foo");
      g.setEdge("a", "b", undefined);
      expect(g.edge("a", "b")).toBeUndefined();
      expect(g.hasEdge("a", "b")).toBe(true);
    });

    test("changes the value for a multi-edge if it is already in the graph", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b", "value", "name");
      g2.setEdge("a", "b", undefined, "name");
      expect(g2.edge("a", "b", "name")).toBeUndefined();
      expect(g2.hasEdge("a", "b", "name")).toBe(true);
    });

    test("can take an edge object as the first parameter", () => {
      g.setEdge({ v: "a", w: "b" }, "value");
      expect(g.edge("a", "b")).toBe("value");
    });

    test("can take an multi-edge object as the first parameter", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge({ v: "a", w: "b", name: "name" }, "value");
      expect(g2.edge("a", "b", "name")).toBe("value");
    });

    test("uses the stringified form of the id #1", () => {
      g.setEdge(1, 2, "foo");
      expect(g.edges()).toEqual([{ v: "1", w: "2" }]);
      expect(g.edge("1", "2")).toBe("foo");
      expect(g.edge(1, 2)).toBe("foo");
    });

    test("uses the stringified form of the id #2", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge(1, 2, "foo", undefined);
      expect(g2.edges()).toEqual([{ v: "1", w: "2" }]);
      expect(g2.edge("1", "2")).toBe("foo");
      expect(g2.edge(1, 2)).toBe("foo");
    });

    test("uses the stringified form of the id with a name", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge(1, 2, "foo", 3);
      expect(g2.edge("1", "2", "3")).toBe("foo");
      expect(g2.edge(1, 2, 3)).toBe("foo");
      expect(g2.edges()).toEqual([{ v: "1", w: "2", name: "3" }]);
    });

    test("treats edges in opposite directions as distinct in a digraph", () => {
      g.setEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(true);
      expect(g.hasEdge("b", "a")).toBe(false);
    });

    test("handles undirected graph edges", () => {
      const g2 = new Graph({ directed: false });
      g2.setEdge("a", "b", "foo");
      expect(g2.edge("a", "b")).toBe("foo");
      expect(g2.edge("b", "a")).toBe("foo");
    });

    test("handles undirected edges where id has different order than Stringified id", () => {
      const g2 = new Graph({ directed: false });
      g2.setEdge(9, 10, "foo");
      expect(g2.hasEdge("9", "10")).toBe(true);
      expect(g2.hasEdge(9, 10)).toBe(true);
      expect(g2.hasEdge("10", "9")).toBe(true);
      expect(g2.hasEdge(10, 9)).toBe(true);
      expect(g2.edge("9", "10")).toEqual("foo");
      expect(g2.edge(9, 10)).toEqual("foo");
    });

    test("is chainable", () => {
      expect(g.setEdge("a", "b")).toBe(g);
    });
  });

  describe("setDefaultEdgeLabel", () => {
    test("sets a default label for new edges", () => {
      g.setDefaultEdgeLabel("foo");
      g.setEdge("a", "b");
      expect(g.edge("a", "b")).toBe("foo");
    });

    test("does not change existing edges", () => {
      g.setEdge("a", "b");
      g.setDefaultEdgeLabel("foo");
      expect(g.edge("a", "b")).toBeUndefined();
    });

    test("is not used if an explicit value is set", () => {
      g.setDefaultEdgeLabel("foo");
      g.setEdge("a", "b", "bar");
      expect(g.edge("a", "b")).toBe("bar");
    });

    test("can take a function", () => {
      g.setDefaultEdgeLabel(() => "foo");
      g.setEdge("a", "b");
      expect(g.edge("a", "b")).toBe("foo");
    });

    test("can take a function that takes the edge's endpoints and name", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setDefaultEdgeLabel((v, w, name) => {
        return v + "-" + w + "-" + name + "-foo";
      });
      g2.setEdge({ v: "a", w: "b", name: "name"});
      expect(g2.edge("a", "b", "name")).toBe("a-b-name-foo");
    });

    test("does not set a default value for a multi-edge that already exists", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b", "old", "name");
      g2.setDefaultEdgeLabel(() => "should not set this");
      g2.setEdge({ v: "a", w: "b", name: "name"});
      expect(g2.edge("a", "b", "name")).toBe("old");
    });

    test("is chainable", () => {
      expect(g.setDefaultEdgeLabel("foo")).toBe(g);
    });
  });

  describe("edge", () => {
    test("returns undefined if the edge isn't part of the graph", () => {
      expect(g.edge("a", "b")).toBeUndefined();
      expect(g.edge({ v: "a", w: "b" })).toBeUndefined();
      expect(g.edge("a", "b", "foo")).toBeUndefined();
    });

    test("returns the value of the edge if it is part of the graph", () => {
      g.setEdge("a", "b", { foo: "bar" });
      expect(g.edge("a", "b")).toEqual({ foo: "bar" });
      expect(g.edge({ v: "a", w: "b" })).toEqual({ foo: "bar" });
      expect(g.edge("b", "a")).toBeUndefined();
    });

    test("returns the value of a multi-edge if it is part of the graph", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b", { bar: "baz" }, "foo");
      expect(g2.edge("a", "b", "foo")).toEqual({ bar: "baz" });
      expect(g2.edge("a", "b")).toBeUndefined();
    });

    test("returns an edge in either direction in an undirected graph", () => {
      const g2 = new Graph({ directed: false });
      g2.setEdge("a", "b", { foo: "bar" });
      expect(g2.edge("a", "b")).toEqual({ foo: "bar" });
      expect(g2.edge("b", "a")).toEqual({ foo: "bar" });
    });
  });

  describe("removeEdge", () => {
    test("has no effect if the edge is not in the graph", () => {
      g.removeEdge("a", "b");
      expect(g.hasEdge("a", "b")).toBe(false);
      expect(g.edgeCount()).toBe(0);
    });

    test("can remove an edge by edgeObj", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge({ v: "a", w: "b", name: "foo" });
      g2.removeEdge({ v: "a", w: "b", name: "foo" });
      expect(g2.hasEdge("a", "b", "foo")).toBe(false);
      expect(g2.edgeCount()).toBe(0);
    });

    test("can remove an edge by separate ids", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge({ v: "a", w: "b", name: "foo" });
      g2.removeEdge("a", "b", "foo");
      expect(g2.hasEdge("a", "b", "foo")).toBe(false);
      expect(g2.edgeCount()).toBe(0);
    });

    test("correctly removes neighbors", () => {
      g.setEdge("a", "b");
      g.removeEdge("a", "b");
      expect(g.successors("a")).toEqual([]);
      expect(g.neighbors("a")).toEqual([]);
      expect(g.predecessors("b")).toEqual([]);
      expect(g.neighbors("b")).toEqual([]);
    });

    test("correctly decrements neighbor counts", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge({ v: "a", w: "b", name: "foo" });
      g2.removeEdge("a", "b");
      expect(g2.hasEdge("a", "b", "foo"));
      expect(g2.successors("a")).toEqual(["b"]);
      expect(g2.neighbors("a")).toEqual(["b"]);
      expect(g2.predecessors("b")).toEqual(["a"]);
      expect(g2.neighbors("b")).toEqual(["a"]);
    });

    test("works with undirected graphs", () => {
      const g2 = new Graph({ directed: false });
      g2.setEdge("h", "g");
      g2.removeEdge("g", "h");
      expect(g2.neighbors("g")).toEqual([]);
      expect(g2.neighbors("h")).toEqual([]);
    });

    test("is chainable", () => {
      g.setEdge("a", "b");
      expect(g.removeEdge("a", "b")).toBe(g);
    });
  });

  describe("inEdges", () => {
    test("returns undefined for a node that is not in the graph", () => {
      expect(g.inEdges("a")).toBeUndefined();
    });

    test("returns the edges that point at the specified node", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      expect(g.inEdges("a")).toEqual([]);
      expect(g.inEdges("b")).toEqual([{ v: "a", w: "b" }]);
      expect(g.inEdges("c")).toEqual([{ v: "b", w: "c" }]);
    });

    test("works for multigraphs", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge("a", "b", undefined, "bar");
      g2.setEdge("a", "b", undefined, "foo");
      expect(g2.inEdges("a")).toEqual([]);
      expect(_.sortBy(g2.inEdges("b"), "name")).toEqual([
        { v: "a", w: "b", name: "bar" },
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
    });

    test("can return only edges from a specified node", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge("a", "b", undefined, "foo");
      g2.setEdge("a", "c");
      g2.setEdge("b", "c");
      g2.setEdge("z", "a");
      g2.setEdge("z", "b");
      expect(g2.inEdges("a", "b")).toEqual([]);
      expect(_.sortBy(g2.inEdges("b", "a"), "name")).toEqual([
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
    });
  });

  describe("outEdges", () => {
    test("returns undefined for a node that is not in the graph", () => {
      expect(g.outEdges("a")).toBeUndefined();
    });

    test("returns all edges that this node points at", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      expect(g.outEdges("a")).toEqual([{ v: "a", w: "b" }]);
      expect(g.outEdges("b")).toEqual([{ v: "b", w: "c" }]);
      expect(g.outEdges("c")).toEqual([]);
    });

    test("works for multigraphs", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge("a", "b", undefined, "bar");
      g2.setEdge("a", "b", undefined, "foo");
      expect(_.sortBy(g2.outEdges("a"), "name")).toEqual([
        { v: "a", w: "b", name: "bar" },
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
      expect(g2.outEdges("b")).toEqual([]);
    });

    test("can return only edges to a specified node", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge("a", "b", undefined, "foo");
      g2.setEdge("a", "c");
      g2.setEdge("b", "c");
      g2.setEdge("z", "a");
      g2.setEdge("z", "b");
      expect(_.sortBy(g2.outEdges("a", "b"), "name")).toEqual([
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
      expect(g2.outEdges("b", "a")).toEqual([]);
    });
  });

  describe("nodeEdges", () => {
    test("returns undefined for a node that is not in the graph", () => {
      expect(g.nodeEdges("a")).toBeUndefined();
    });

    test("returns all edges that this node points at", () => {
      g.setEdge("a", "b");
      g.setEdge("b", "c");
      expect(g.nodeEdges("a")).toEqual([{ v: "a", w: "b" }]);
      expect(_.sortBy(g.nodeEdges("b"), ["v", "w"]))
        .toEqual([{ v: "a", w: "b" }, { v: "b", w: "c" }]);
      expect(g.nodeEdges("c")).toEqual([{ v: "b", w: "c" }]);
    });

    test("works for multigraphs", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge({ v: "a", w: "b", name: "bar" });
      g2.setEdge({ v: "a", w: "b", name: "foo" });
      expect(_.sortBy(g2.nodeEdges("a"), "name")).toEqual([
        { v: "a", w: "b", name: "bar" },
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
      expect(_.sortBy(g2.nodeEdges("b"), "name")).toEqual([
        { v: "a", w: "b", name: "bar" },
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
    });

    test("can return only edges between specific nodes", () => {
      const g2 = new Graph({ multigraph: true });
      g2.setEdge("a", "b");
      g2.setEdge({ v: "a", w: "b", name: "foo" });
      g2.setEdge("a", "c");
      g2.setEdge("b", "c");
      g2.setEdge("z", "a");
      g2.setEdge("z", "b");
      expect(_.sortBy(g2.nodeEdges("a", "b"), "name")).toEqual([
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
      expect(_.sortBy(g2.nodeEdges("b", "a"), "name")).toEqual([
        { v: "a", w: "b", name: "foo" },
        { v: "a", w: "b" },
      ]);
    });
  });
});
