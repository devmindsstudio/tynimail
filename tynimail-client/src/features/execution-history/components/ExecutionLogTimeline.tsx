import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { STATUS_CONFIG, STATUS_ICONS, formatDate, formatNodeLabel, isActiveStatus } from '../utils/format';

interface LogEntry {
  id?: string;
  node_id: string;
  node_subtype?: string;
  step_id?: number;
  status: string;
  error?: string | null;
  branch_taken?: string | null;
  output_data?: any;
  input_data?: any;
  executed_at?: string;
}

interface Props {
  logs: LogEntry[];
  executionStatus?: string;
}

function OutputDataToggle({ data }: { data: any }) {
  const [open, setOpen] = useState(false);

  let parsed: any = data;
  if (typeof data === 'string') {
    try { parsed = JSON.parse(data); } catch { parsed = data; }
  }

  const isEmpty = !parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0);
  if (isEmpty) return null;

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        Output data
      </button>
      {open && (
        <pre className="mt-1 text-[11px] text-muted-foreground bg-muted rounded-md px-2.5 py-2 overflow-x-auto leading-relaxed">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function ExecutionLogTimeline({ logs, executionStatus }: Props) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No step logs yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log, i) => {
        const cfg = STATUS_CONFIG[log.status];
        const Icon = STATUS_ICONS[log.status] ?? HelpCircle;
        const isLast = i === logs.length - 1;
        const isRunningStep = isActiveStatus(log.status) ||
          (isLast && executionStatus && isActiveStatus(executionStatus) && log.status === 'completed');

        return (
          <div key={log.id ?? i} className="flex gap-3">
            {/* Timeline column: icon + connector line */}
            <div className="flex flex-col items-center flex-shrink-0 w-6">
              <div
                className={`
                  mt-3 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  ${cfg ? `${cfg.pill}` : 'bg-gray-100 text-gray-400'}
                  ${isRunningStep ? 'animate-pulse' : ''}
                `}
              >
                <Icon size={11} />
              </div>
              {!isLast && (
                <div className="flex-1 w-px bg-border mt-1 mb-0 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 pb-4 ${isLast ? '' : ''}`}>
              <div className="flex items-start justify-between gap-2 mt-2.5">
                <span className="text-sm font-medium text-foreground leading-tight">
                  {log.step_id ? `Step ${log.step_id}` : `Step ${i + 1}`}
                  <span className="mx-1.5 text-muted-foreground font-normal">·</span>
                  <span className="capitalize">{formatNodeLabel(log.node_subtype)}</span>
                </span>
                <span className="text-[11px] text-muted-foreground flex-shrink-0 mt-0.5">
                  {formatDate(log.executed_at)}
                </span>
              </div>

              {/* Branch taken */}
              {log.branch_taken && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                    → {log.branch_taken}
                  </span>
                </div>
              )}

              {/* Error */}
              {log.error && (
                <p className="text-xs text-red-500 mt-1 leading-snug">{log.error}</p>
              )}

              {/* Output data (collapsible) */}
              <OutputDataToggle data={log.output_data} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
