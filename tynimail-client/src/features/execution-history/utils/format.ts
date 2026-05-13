import { CheckCircle2, XCircle, Play, Clock, Ban, SkipForward } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StatusConfig {
  label: string;
  icon: ReactNode;
  pill: string;       // bg + text classes for pill badge
  iconColor: string;  // text color class for timeline icon
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  completed:         { label: 'Completed',         icon: null, pill: 'bg-green-100 text-green-700',  iconColor: 'text-green-500' },
  failed:            { label: 'Failed',            icon: null, pill: 'bg-red-100 text-red-600',      iconColor: 'text-red-500'   },
  skipped:           { label: 'Skipped',           icon: null, pill: 'bg-gray-100 text-gray-500',    iconColor: 'text-gray-400'  },
  running:           { label: 'Running',           icon: null, pill: 'bg-blue-100 text-blue-600',    iconColor: 'text-blue-500'  },
  waiting:           { label: 'Waiting',           icon: null, pill: 'bg-amber-100 text-amber-600',  iconColor: 'text-amber-500' },
  waiting_for_event: { label: 'Waiting for event', icon: null, pill: 'bg-amber-100 text-amber-600',  iconColor: 'text-amber-500' },
  cancelled:         { label: 'Cancelled',         icon: null, pill: 'bg-gray-100 text-gray-500',    iconColor: 'text-gray-400'  },
};

// Lucide icons are React elements so we assign them after the fact
// to avoid issues with the icon field type being ReactNode
export const STATUS_ICONS: Record<string, any> = {
  completed:         CheckCircle2,
  failed:            XCircle,
  skipped:           SkipForward,
  running:           Play,
  waiting:           Clock,
  waiting_for_event: Clock,
  cancelled:         Ban,
};

export const STATUS_TABS = [
  { value: '' as const,                label: 'All'      },
  { value: 'completed' as const,       label: 'Completed'},
  { value: 'failed' as const,          label: 'Failed'   },
  { value: 'running' as const,         label: 'Running'  },
  { value: 'waiting' as const,         label: 'Waiting'  },
];

export type StatusFilter = '' | 'completed' | 'failed' | 'running' | 'waiting' | 'waiting_for_event' | 'cancelled';

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDuration(started: string | null | undefined, completed: string | null | undefined): string | null {
  if (!started || !completed) return null;
  const ms = new Date(completed).getTime() - new Date(started).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatNodeLabel(subtype: string | null | undefined): string {
  if (!subtype) return 'Unknown';
  return subtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function isActiveStatus(status: string): boolean {
  return status === 'running' || status === 'waiting' || status === 'waiting_for_event';
}
