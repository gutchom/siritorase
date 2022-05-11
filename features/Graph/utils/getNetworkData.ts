import { DataSet } from 'vis-data';
import type { Edge, Node } from 'vis-network';
import type { PictureNode } from 'features/Drawing/types';

export default function getNetworkData(pictures: PictureNode[]): {
  nodes: DataSet<Node>;
  edges: DataSet<Edge>;
} {
  const nodes: Node[] = pictures.map(({ id, src, title }) => ({
    id,
    shape: 'image',
    image: src,
    label: title,
  }));
  const edges: Edge[] = pictures.map(({ id, parentId }) => ({
    from: parentId,
    to: id,
  }));

  return { nodes: new DataSet(nodes), edges: new DataSet(edges) };
}
