import { Position } from '@xyflow/react';
import { Percent } from 'lucide-react';
import { BaseNode } from './BaseNode';

export function PercentageSplitNode({ id, data, selected }: any) {
  const branches: any[] = data.config?.branches ?? [];

  const sourceHandles = branches.map((branch: any, i: number) => ({
    type: 'source' as const,
    id: branch.id,
    position: Position.Bottom,
    style: { left: `${((i + 1) * 100) / (branches.length + 1)}%` },
  }));

  const summary = branches.map((b: any) => `${b.name}: ${b.percentage}%`).join(' / ');

  return (
    <BaseNode
      id={id}
      icon={<Percent size={14} />}
      label={data.label}
      stepId={data.stepId}
      validated={data.validated}
      headerColor="bg-orange-100 text-orange-800"
      ringColor="ring-orange-400"
      borderColor="border-orange-200"
      nodeType="percentageSplit"
      subtype="percentage_split"
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        ...sourceHandles,
      ]}
    >
      {summary && (
        <div className="text-xs text-orange-700 bg-orange-50 rounded px-2 py-0.5 mt-1">{summary}</div>
      )}
    </BaseNode>
  );
}
