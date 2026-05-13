import { Position } from '@xyflow/react';
import { GitFork } from 'lucide-react';
import { BaseNode } from './BaseNode';

export function ConditionalSplitNode({ id, data, selected }: any) {
  const branches: any[] = data.config?.branches ?? [];

  const sourceHandles = branches.map((branch: any, i: number) => ({
    type: 'source' as const,
    id: branch.id,
    position: Position.Bottom,
    style: {
      left: `${((i + 1) * 100) / (branches.length + 1)}%`,
      background: branch.isFallback ? '#94a3b8' : '#f97316',
    },
  }));

  return (
    <BaseNode
      id={id}
      icon={<GitFork size={14} />}
      label={data.label}
      stepId={data.stepId}
      validated={data.validated}
      headerColor="bg-orange-100 text-orange-800"
      ringColor="ring-orange-400"
      borderColor="border-orange-200"
      nodeType="conditionalSplit"
      subtype="conditional_split"
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        ...sourceHandles,
      ]}
    >
      {branches.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1">
          {branches.map((b: any) => (
            <span key={b.id} className={`text-xs px-1.5 py-0.5 rounded ${b.isFallback ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-700'}`}>
              {b.name}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
}
