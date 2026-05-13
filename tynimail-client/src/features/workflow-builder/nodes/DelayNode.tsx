import { Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { BaseNode } from './BaseNode';

function formatDuration(config: any): string {
  if (!config) return '';
  const parts: string[] = [];
  if (config.months > 0) parts.push(`${config.months}mo`);
  if (config.days > 0) parts.push(`${config.days}d`);
  if (config.hours > 0) parts.push(`${config.hours}h`);
  if (config.minutes > 0) parts.push(`${config.minutes}m`);
  return parts.join(' ') || '';
}

export function DelayNode({ id, data, selected }: any) {
  const duration = formatDuration(data.config);
  return (
    <BaseNode
      id={id}
      icon={<Clock size={14} />}
      label={data.label}
      stepId={data.stepId}
      validated={data.validated}
      headerColor="bg-orange-100 text-orange-800"
      ringColor="ring-orange-400"
      borderColor="border-orange-200"
      nodeType="delay"
      subtype="delay"
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom },
      ]}
    >
      {duration && (
        <div className="text-xs text-orange-700 bg-orange-50 rounded px-2 py-0.5 w-fit mt-1">
          Wait {duration}
        </div>
      )}
    </BaseNode>
  );
}
