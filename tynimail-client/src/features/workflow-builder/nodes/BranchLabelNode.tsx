import { Handle, Position } from '@xyflow/react';

export function BranchLabelNode({ data }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm pointer-events-none select-none">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.label}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
