import type { Edge, IdType } from 'vis-network';

export default function trace(edges: Edge[], nodeId: IdType, toRoot = true) {
  return (function recurse(id?: IdType): Edge[] {
    const upside = edges.find((edge) => edge[toRoot ? 'to' : 'from'] === id);
    if (!upside) {
      return [];
    } else {
      return [upside].concat(recurse(upside[toRoot ? 'from' : 'to']));
    }
  })(nodeId);
}
