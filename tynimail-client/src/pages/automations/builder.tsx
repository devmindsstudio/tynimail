import { useParams, useBlocker } from 'react-router';
import { useEffect } from 'react';
import { useWorkflow } from '@/features/workflow-builder/hooks/useWorkflowApi';
import { useWorkflowStore } from '@/features/workflow-builder/hooks/useWorkflowStore';
import { WorkflowBuilder } from '@/features/workflow-builder/WorkflowBuilder';
import { deserializeFlowData } from '@/features/workflow-builder/utils/serializer';

export default function WorkflowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useWorkflow(id!);
  const fromFlowData = useWorkflowStore(s => s.fromFlowData);
  const isDirty = useWorkflowStore(s => s.isDirty);

  // Block in-app navigation (sidebar links, back button via router) when unsaved
  useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname
      ? !window.confirm('You have unsaved changes. Leave anyway?')
      : false
  );

  // Block browser tab close / refresh / external navigation when unsaved
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    if (data) {
      const workflow = data?.data ?? data;
      const { nodes, edges } = deserializeFlowData(workflow.flow_data ?? { nodes: [], edges: [] });
      fromFlowData(
        { nodes, edges },
        {
          id: workflow.id,
          name: workflow.name,
          status: workflow.status,
          updatedAt: workflow.updated_at,
        },
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400">Loading workflow...</div>
      </div>
    );
  }

  return <WorkflowBuilder />;
}
