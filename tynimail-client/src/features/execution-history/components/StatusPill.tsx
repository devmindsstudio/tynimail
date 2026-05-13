import { STATUS_CONFIG, STATUS_ICONS } from '../utils/format';

export function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-gray-400 capitalize">{status?.replace(/_/g, ' ')}</span>;
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.pill}`}>
      {Icon && <Icon size={11} />}
      {cfg.label}
    </span>
  );
}
