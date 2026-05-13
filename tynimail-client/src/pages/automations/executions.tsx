import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';
import { useWorkflow, useWorkflowExecutions } from '@/features/workflow-builder/hooks/useWorkflowApi';
import { StatusPill } from '@/features/execution-history/components/StatusPill';
import { ExecutionDetail } from '@/features/execution-history/components/ExecutionDetail';
import { STATUS_TABS, formatDate, formatDuration, isActiveStatus } from '@/features/execution-history/utils/format';
import type { StatusFilter } from '@/features/execution-history/utils/format';

export default function ExecutionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: workflowData } = useWorkflow(id!);
  const { data, isLoading } = useWorkflowExecutions(id!, {
    status: statusFilter || undefined,
    page,
  });

  const workflow = workflowData?.data ?? workflowData;
  const executions: any[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const limit: number = data?.limit ?? 50;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/automations')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-muted-foreground text-sm">Automations</span>
        <span className="text-muted-foreground text-sm">/</span>
        <h1 className="text-base font-semibold">{workflow?.name ?? 'Execution History'}</h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-0 border-b mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              statusFilter === tab.value
                ? 'border-foreground text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : executions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No executions found</div>
      ) : (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Started</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((exec: any) => {
                  const dur = formatDuration(exec.started_at, exec.completed_at);
                  const contact = exec.contact?.email ?? exec.contact_email ?? exec.contact_id ?? '—';
                  return (
                    <tr
                      key={exec.id}
                      onClick={() => setSelectedId(exec.id)}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${
                        exec.id === selectedId ? 'bg-muted/60' : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{contact}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusPill status={exec.status} />
                          {isActiveStatus(exec.status) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(exec.started_at)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{dur ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>{total} total</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-40"
                >Prev</button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-40"
                >Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail drawer */}
      {selectedId && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setSelectedId(null)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col border-l">
            <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0">
              <h2 className="text-sm font-semibold">Execution detail</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ExecutionDetail executionId={selectedId} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
