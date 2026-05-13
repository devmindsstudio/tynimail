import { useState } from 'react';
import { X } from 'lucide-react';
import { useWorkflowExecutions } from '../hooks/useWorkflowApi';
import { StatusPill } from '@/features/execution-history/components/StatusPill';
import { ExecutionDetail } from '@/features/execution-history/components/ExecutionDetail';
import { STATUS_TABS, formatDate, formatDuration, isActiveStatus } from '@/features/execution-history/utils/format';
import type { StatusFilter } from '@/features/execution-history/utils/format';

interface ExecutionsModalProps {
  workflowId: string;
  workflowName: string;
  onClose: () => void;
}

export function ExecutionsModal({ workflowId, workflowName, onClose }: ExecutionsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useWorkflowExecutions(workflowId, {
    status: statusFilter || undefined,
    page,
  });

  const executions: any[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const limit: number = data?.limit ?? 50;
  const totalPages = Math.ceil(total / limit);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[920px] max-w-[95vw] h-[82vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold">Execution History</h2>
            <p className="text-xs text-muted-foreground">{workflowName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Split body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — execution list */}
          <div className="w-[340px] flex-shrink-0 border-r flex flex-col overflow-hidden">

            {/* Status filter tabs */}
            <div className="flex gap-0 border-b flex-shrink-0 overflow-x-auto">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusFilter(tab.value); setPage(1); setSelectedId(null); }}
                  className={`px-3 py-2.5 text-xs whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    statusFilter === tab.value
                      ? 'border-foreground text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : executions.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  No executions found
                </div>
              ) : (
                executions.map((exec: any) => {
                  const isSelected = exec.id === selectedId;
                  const dur = formatDuration(exec.started_at, exec.completed_at);
                  const contact = exec.contact?.email ?? exec.contact_email ?? exec.contact_id ?? '—';
                  return (
                    <button
                      key={exec.id}
                      onClick={() => setSelectedId(exec.id)}
                      className={`w-full text-left px-4 py-3 border-b last:border-0 transition-colors ${
                        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium truncate text-foreground">{contact}</span>
                        <StatusPill status={exec.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formatDate(exec.started_at)}</span>
                        {dur && <><span>·</span><span>{dur}</span></>}
                        {isActiveStatus(exec.status) && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t flex-shrink-0 text-xs text-muted-foreground">
                <span>{total} total</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page <= 1}
                    className="px-2 py-1 border rounded hover:bg-muted disabled:opacity-40"
                  >Prev</button>
                  <span className="px-1.5">{page}/{totalPages}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages}
                    className="px-2 py-1 border rounded hover:bg-muted disabled:opacity-40"
                  >Next</button>
                </div>
              </div>
            )}
          </div>

          {/* Right — execution detail */}
          <div className="flex-1 overflow-hidden">
            <ExecutionDetail
              executionId={selectedId}
              emptyState={
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Select an execution</p>
                  <p className="text-xs text-muted-foreground/60">Click a row on the left to view details</p>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
