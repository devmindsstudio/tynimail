import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/Canvas';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { WorkflowToolbar } from './components/WorkflowToolbar';
import { useWorkflowStore } from './hooks/useWorkflowStore';

export function WorkflowBuilder() {
  const { panelMode } = useWorkflowStore();

  return (
    <div className="flex flex-col h-screen">
      <WorkflowToolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — always the palette */}
        <div className="w-64 flex-shrink-0 border-r bg-white overflow-hidden">
          <ReactFlowProvider>
            <NodePalette />
          </ReactFlowProvider>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-50">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>

        {/* Right config panel — slides in when a node is selected */}
        {panelMode === 'config' && (
          <div className="w-72 flex-shrink-0 border-l bg-white overflow-hidden">
            <NodeConfigPanel />
          </div>
        )}
      </div>
    </div>
  );
}
