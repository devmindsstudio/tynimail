import type { Node, Edge } from '@xyflow/react';

export function serializeFlowData(nodes: Node[], edges: Edge[]) {
  return { nodes, edges };
}

export function deserializeFlowData(data: { nodes: any[]; edges: any[] }) {
  return {
    nodes: (data?.nodes ?? []) as Node[],
    edges: (data?.edges ?? []) as Edge[],
  };
}
