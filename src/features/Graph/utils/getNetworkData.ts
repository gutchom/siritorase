import { DataSet } from 'vis-data';
import type { Edge, Node } from 'vis-network';
import type { PostNode } from '@/features/Drawing/types';
import { thumb } from '@/functions/src';

function getIsLeaf(edges: Edge[]): (node: Node) => boolean {
  const parents = new Set(edges.map(({ from }) => from));
  return (node) => !parents.has(node.id);
}

export default function getNetworkData(posts: PostNode[]): {
  nodes: DataSet<Node>;
  edges: DataSet<Edge>;
} {
  const edges: Edge[] = posts
    .map(({ id, parent }) => ({
      from: parent,
      to: id,
    }))
    .filter(({ from, to }) => from.length > 0 && to.length > 0);

  const isLeaf = getIsLeaf(edges);
  const leaf = {
    size: 50,
    label: '？？？',
    color: {
      border: '#2b6',
      highlight: '#2b6',
    },
  };

  const nodes: Node[] = posts
    .map(
      ({ id, title }): Node => ({
        id,
        size: 30,
        shape: 'image',
        image: thumb(id, title),
        label: title,
        chosen: {
          node: true,
          label: (values) => (values.size *= 2.5),
        },
      }),
    )
    .map((node) => (isLeaf(node) ? { ...node, ...leaf } : node));

  return { nodes: new DataSet(nodes), edges: new DataSet(edges) };
}
