import { DataSet } from 'vis-data';
import type { Edge, Node } from 'vis-network';
import type { PictureNode } from 'features/Drawing/types';

function getIsLeaf(edges: Edge[]): (node: Node) => boolean {
  const parents = new Set(edges.map(({ from }) => from));
  return (node) => !parents.has(node.id);
}

export default function getNetworkData(pictures: PictureNode[]): {
  nodes: DataSet<Node>;
  edges: DataSet<Edge>;
} {
  const edges: Edge[] = pictures
    .map(({ id, parentId }) => ({
      from: parentId,
      to: id,
    }))
    .filter(({ from, to }) => from.length > 0 && to.length > 0);

  const isLeaf = getIsLeaf(edges);
  const leaf = {
    label: '？？？',
    color: {
      border: '#2b6',
      highlight: '#2b6',
    },
  };

  const nodes: Node[] = pictures
    .map(({ id, src, title }) => ({
      id,
      shape: 'image',
      image: src,
      label: title,
    }))
    .map((node) => (isLeaf(node) ? { ...node, ...leaf } : node));

  return { nodes: new DataSet(nodes), edges: new DataSet(edges) };
}
