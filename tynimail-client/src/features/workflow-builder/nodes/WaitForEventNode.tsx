import { Position } from '@xyflow/react';
import { Hourglass } from 'lucide-react';
import { BaseNode } from './BaseNode';

export function WaitForEventNode({ id, data, selected }: any) {
  return (
    <BaseNode
      id={id}
      icon={<Hourglass size={14} />}
      label={data.label}
      stepId={data.stepId}
      validated={data.validated}
      headerColor="bg-orange-100 text-orange-800"
      ringColor="ring-orange-400"
      borderColor="border-orange-200"
      nodeType="waitForEvent"
      subtype="wait_for_event"
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', id: 'yes', position: Position.Bottom, style: { left: '30%' } },
        { type: 'source', id: 'no',  position: Position.Bottom, style: { left: '70%' } },
      ]}
    >
      <div className="flex gap-2 mt-1">
        <span className="text-xs text-orange-700 bg-orange-50 rounded px-1.5 py-0.5">✓ Yes (event)</span>
        <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">✗ No (timeout)</span>
      </div>
    </BaseNode>
  );
}
