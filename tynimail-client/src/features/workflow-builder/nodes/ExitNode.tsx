import { Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { LogOut, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';

export function ExitNode({ id, selected }: any) {
  const deleteNode = useWorkflowStore(s => s.deleteNode);

  return (
    <div className={`relative bg-white border rounded-lg shadow-sm w-40 border-gray-200 ${selected ? 'ring-2 ring-gray-400 ring-offset-1' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2.5 !h-2.5 !border-2 !border-white" />
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2">
          <LogOut size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Exit</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); deleteNode(id); }}
          className="nodrag text-gray-400 hover:text-red-500 transition-colors"
          title="Delete exit node"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
