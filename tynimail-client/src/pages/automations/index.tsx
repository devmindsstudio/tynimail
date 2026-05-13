import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Search, Filter, Plus, MoreVertical, Mail, UserPlus } from 'lucide-react';
import { useWorkflowList, useCreateWorkflow, useDeleteWorkflow, useChangeWorkflowStatus } from '@/features/workflow-builder/hooks/useWorkflowApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

type StatusFilter = '' | 'active' | 'draft' | 'paused' | 'archived';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:   'bg-green-100 text-green-700 border-0',
    draft:    'bg-transparent text-muted-foreground border border-border',
    paused:   'bg-orange-100 text-orange-700 border-0',
    archived: 'bg-black text-white border-0',
  };
  return (
    <Badge className={`text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}>
      {status}
    </Badge>
  );
}

export default function AutomationsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useWorkflowList({ status: statusFilter || undefined });
  const createWorkflow = useCreateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();

  const allWorkflows: any[] = Array.isArray(data) ? data : (data?.data ?? []);
  const workflows = allWorkflows.filter((wf: any) =>
    wf.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Stat card values
  const totalWorkflows = allWorkflows.length;
  const activeContacts = allWorkflows.reduce((sum: number, wf: any) => sum + (wf.active_executions ?? 0), 0);
  const emailSent = allWorkflows.reduce((sum: number, wf: any) => sum + (wf.total_executions ?? 0), 0);

  const handleCreate = async () => {
    try {
      const wf = await createWorkflow.mutateAsync({ name: 'Untitled Automation' });
      navigate(`/automations/${wf.data?.id ?? wf.id}/builder`);
    } catch {
      toast.error('Failed to create workflow');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteWorkflow.mutateAsync(id);
      toast.success('Workflow deleted');
    } catch {
      toast.error('Failed to delete workflow');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Workflows', value: String(totalWorkflows).padStart(2, '0'), icon: <Filter size={16} /> },
          { label: 'Active Contacts',  value: String(activeContacts),                  icon: <UserPlus size={16} /> },
          { label: 'Emails Sent',      value: emailSent > 0 ? emailSent.toLocaleString() : '—', icon: <Mail size={16} /> },
        ].map(stat => (
          <div key={stat.label} className="border rounded-lg p-4 bg-card flex items-center gap-4">
            <div className="text-muted-foreground">{stat.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              statusFilter === tab.value
                ? 'border-black text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workflows"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 w-56 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter size={13} />
            Filters
          </Button>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={createWorkflow.isPending}
          className="bg-black text-white hover:bg-black/90 gap-1.5"
        >
          <Plus size={14} />
          {createWorkflow.isPending ? 'Creating...' : 'Create Workflow'}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No automations yet</p>
          <Button onClick={handleCreate} className="bg-black text-white hover:bg-black/90 gap-1.5">
            <Plus size={14} />
            Create your first one
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Workflow</TableHead>
                <TableHead className="text-xs">Contacts</TableHead>
                <TableHead className="text-xs">Emails Sent</TableHead>
                <TableHead className="text-xs">Date Modified</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((wf: any) => (
                <WorkflowRow
                  key={wf.id}
                  workflow={wf}
                  isDeleting={deletingId === wf.id}
                  onEdit={() => navigate(`/automations/${wf.id}/builder`)}
                  onViewRuns={() => navigate(`/automations/${wf.id}/executions`)}
                  onDelete={() => handleDelete(wf.id, wf.name)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

interface WorkflowRowProps {
  workflow: any;
  isDeleting: boolean;
  onEdit: () => void;
  onViewRuns: () => void;
  onDelete: () => void;
}

function WorkflowRow({ workflow, isDeleting, onEdit, onViewRuns, onDelete }: WorkflowRowProps) {
  const changeStatus = useChangeWorkflowStatus(workflow.id);

  const handleActivate = () => {
    changeStatus.mutate('active', {
      onSuccess: () => toast.success('Workflow activated'),
      onError: () => toast.error('Failed to activate'),
    });
  };

  const handlePause = () => {
    changeStatus.mutate('paused', {
      onSuccess: () => toast.success('Workflow paused'),
      onError: () => toast.error('Failed to pause'),
    });
  };

  const handleArchive = () => {
    if (!window.confirm('Archive this workflow?')) return;
    changeStatus.mutate('archived', {
      onSuccess: () => toast.success('Workflow archived'),
      onError: () => toast.error('Failed to archive'),
    });
  };

  const dateModified = workflow.updated_at
    ? new Date(workflow.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <TableRow className="hover:bg-muted/30 cursor-pointer" onClick={onEdit}>
      <TableCell className="text-sm font-medium">{workflow.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{workflow.total_executions ?? 0}</TableCell>
      <TableCell className="text-sm text-muted-foreground">—</TableCell>
      <TableCell className="text-sm text-muted-foreground">{dateModified}</TableCell>
      <TableCell><StatusBadge status={workflow.status} /></TableCell>
      <TableCell onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted">
              <MoreVertical size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-sm">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onViewRuns}>View runs</DropdownMenuItem>
            {workflow.status === 'active' ? (
              <DropdownMenuItem onClick={handlePause} disabled={changeStatus.isPending}>
                Pause
              </DropdownMenuItem>
            ) : workflow.status !== 'archived' ? (
              <DropdownMenuItem onClick={handleActivate} disabled={changeStatus.isPending}>
                Activate
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={handleArchive} disabled={changeStatus.isPending}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
