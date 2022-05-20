import type { Edge, IdType, Node } from 'vis-network';

export default function getAncestorsSelection(
  targetNode: IdType,
  nodes: Node[],
  edges: Edge[],
) {
  return (function trace(nodeId: IdType): [node: IdType, edge: IdType][] {
    const edge = edges.find((edge) => edge.to === nodeId);
    return edge
      ? edge.from && edge.id
        ? [[edge.from, edge.id], ...trace(edge.from)]
        : []
      : [];
  })(targetNode).reduce<{
    nodes: IdType[];
    edges: IdType[];
  }>(
    ({ nodes, edges }, [node, edge]) => ({
      nodes: [...nodes, node],
      edges: [...edges, edge],
    }),
    {
      nodes: [targetNode],
      edges: [],
    },
  );
}
