import { useWorkflowStore } from './useWorkflowStore';

export function useWorkflowValidation() {
  const { nodes, edges } = useWorkflowStore();

  return function validate(): string[] {
    const errors: string[] = [];

    // 1. Must have at least one trigger node
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger');
    }

    // 2. Must have at least one exit node
    if (!nodes.some(n => n.type === 'exit')) {
      errors.push('Workflow must have at least one exit node');
    }

    // 3. All non-exit, non-branchLabel nodes must have at least one outgoing edge
    nodes.forEach(node => {
      if (node.type === 'exit' || node.type === 'branchLabel') return;
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing) {
        errors.push(`Step #${String(node.data?.stepId ?? '')} "${String(node.data?.label ?? '')}" has no outgoing connection`);
      }
    });

    // 4. All nodes must be configured (validated === true)
    nodes.forEach(node => {
      if (node.type === 'exit' || node.type === 'branchLabel') return;
      if (!node.data?.validated) {
        errors.push(`Step #${String(node.data?.stepId ?? '')} "${String(node.data?.label ?? '')}" is not configured`);
      }
    });

    // 5. Percentage split branches must total 100%
    nodes.filter(n => n.type === 'percentageSplit').forEach(node => {
      const branches = (node.data?.config as any)?.branches ?? [];
      const total = branches.reduce((sum: number, b: any) => sum + (b.percentage ?? 0), 0);
      if (total !== 100) {
        errors.push(`Step #${String(node.data?.stepId ?? '')} "${String(node.data?.label ?? '')}": branch percentages must total 100% (currently ${total}%)`);
      }
    });

    // 5b. Split node branches must each have an outgoing edge with correct sourceHandle
    nodes.filter(n => n.type === 'conditionalSplit' || n.type === 'percentageSplit').forEach(node => {
      const branches = (node.data?.config as any)?.branches ?? [];
      const outgoing = edges.filter(e => e.source === node.id);
      branches.forEach((branch: any) => {
        const hasEdge = outgoing.some(e => e.sourceHandle === branch.id);
        if (!hasEdge) {
          errors.push(`Step #${String(node.data?.stepId ?? '')} "${String(node.data?.label ?? '')}": branch "${branch.name}" has no connected output — please re-draw the connection from that handle`);
        }
      });
    });

    // 6. All nodes reachable from a trigger (BFS)
    const reachable = new Set<string>();
    const queue = triggerNodes.map(n => n.id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      edges.filter(e => e.source === current).forEach(e => queue.push(e.target));
    }
    nodes.forEach(node => {
      if (!reachable.has(node.id) && node.type !== 'trigger') {
        errors.push(`Step #${String(node.data?.stepId ?? '')} "${String(node.data?.label ?? '')}" is not reachable from any trigger`);
      }
    });

    // 7. No cycles (DFS)
    const visited = new Set<string>();
    const inStack = new Set<string>();
    let hasCycle = false;

    function dfs(nodeId: string) {
      if (inStack.has(nodeId)) { hasCycle = true; return; }
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      inStack.add(nodeId);
      edges.filter(e => e.source === nodeId).forEach(e => dfs(e.target));
      inStack.delete(nodeId);
    }
    nodes.forEach(n => dfs(n.id));
    if (hasCycle) errors.push('Workflow contains a cycle — loops are not allowed');

    return errors;
  };
}
