import { StatusPill } from './StatusPill';
import { ExecutionLogTimeline } from './ExecutionLogTimeline';
import { useExecutionPolling } from '../hooks/useExecutionPolling';
import { formatDate, formatDuration } from '../utils/format';

interface Props {
  executionId: string | null;
  emptyState?: React.ReactNode;
}

export function ExecutionDetail({ executionId, emptyState }: Props) {
  const { data, isLoading } = useExecutionPolling(executionId);
  const exec = data?.data ?? data;

  if (!executionId) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        {emptyState ?? 'Select an execution to view details'}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!exec) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Execution not found
      </div>
    );
  }

  const dur = formatDuration(exec.started_at, exec.completed_at);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Contact + status header */}
      <div className="px-5 py-3.5 border-b flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {exec.contact?.email ?? exec.contact_email ?? exec.contact_id ?? 'Unknown contact'}
            </p>
            {(exec.contact?.first_name || exec.contact?.last_name) && (
              <p className="text-xs text-muted-foreground truncate">
                {[exec.contact.first_name, exec.contact.last_name].filter(Boolean).join(' ')}
              </p>
            )}
          </div>
          <StatusPill status={exec.status} />
        </div>
      </div>

      {/* Timing bar */}
      <div className="px-5 py-2 border-b bg-muted/40 flex-shrink-0 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span>Started: <span className="text-foreground">{formatDate(exec.started_at)}</span></span>
        {exec.completed_at && (
          <>
            <span className="text-border">·</span>
            <span>Ended: <span className="text-foreground">{formatDate(exec.completed_at)}</span></span>
          </>
        )}
        {dur && (
          <>
            <span className="text-border">·</span>
            <span className="text-foreground font-medium">{dur}</span>
          </>
        )}
        {exec.error_message && (
          <>
            <span className="text-border">·</span>
            <span className="text-red-500 truncate max-w-[240px]">{exec.error_message}</span>
          </>
        )}
      </div>

      {/* Step logs timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <ExecutionLogTimeline logs={exec.logs ?? []} executionStatus={exec.status} />
      </div>
    </div>
  );
}
