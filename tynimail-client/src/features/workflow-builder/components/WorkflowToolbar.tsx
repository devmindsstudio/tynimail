import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Undo2, Redo2, Save, ChevronDown, ArrowLeft, History } from 'lucide-react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { useSaveWorkflow, useChangeWorkflowStatus } from '../hooks/useWorkflowApi';
import { useWorkflowValidation } from '../hooks/useWorkflowValidation';
import { ValidationModal } from './ValidationModal';
import { ExecutionsModal } from './ExecutionsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft:    'bg-transparent text-muted-foreground border border-border',
    active:   'bg-green-100 text-green-700 border-0',
    paused:   'bg-orange-100 text-orange-700 border-0',
    archived: 'bg-black text-white border-0',
  };
  return (
    <Badge className={`text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}>
      {status}
    </Badge>
  );
}

export function WorkflowToolbar() {
  const store = useWorkflowStore();
  const navigate = useNavigate();
  const save = useSaveWorkflow(store.workflowId ?? '');
  const changeStatus = useChangeWorkflowStatus(store.workflowId ?? '');
  const validate = useWorkflowValidation();
  const [editingName, setEditingName] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showExecutions, setShowExecutions] = useState(false);

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        name: store.workflowName,
        flow_data: store.toFlowData(),
        triggers: store.toTriggersArray(),
      });
      store.markSaved();
      toast.success('Workflow saved');
    } catch {
      toast.error('Failed to save workflow');
    }
  };

  const handleActivate = async () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }

    if (store.isDirty) {
      try {
        await save.mutateAsync({
          name: store.workflowName,
          flow_data: store.toFlowData(),
          triggers: store.toTriggersArray(),
        });
        store.markSaved();
      } catch {
        toast.error('Failed to save before activating');
        return;
      }
    }

    changeStatus.mutate('active', {
      onSuccess: () => {
        store.setWorkflowStatus('active');
        toast.success('Workflow activated!');
      },
      onError: () => toast.error('Activation failed'),
    });
  };

  const handlePause = () => {
    changeStatus.mutate('paused', {
      onSuccess: () => {
        store.setWorkflowStatus('paused');
        toast.success('Workflow paused');
      },
      onError: () => toast.error('Failed to pause workflow'),
    });
  };

  const handleBack = () => {
    if (store.isDirty) {
      if (!window.confirm('You have unsaved changes. Leave anyway?')) return;
    }
    navigate('/automations');
  };

  return (
    <div className="h-12 border-b bg-background flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: back + name + status */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        {editingName ? (
          <Input
            autoFocus
            value={store.workflowName}
            onChange={e => store.setWorkflowName(e.target.value)}
            onBlur={() => { setEditingName(false); handleSave(); }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditingName(false); handleSave(); } }}
            className="h-7 text-sm w-48"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1 text-sm font-medium hover:bg-muted px-2 py-1 rounded-md transition-colors"
          >
            {store.workflowName}
            <ChevronDown size={13} />
          </button>
        )}

        <StatusBadge status={store.workflowStatus} />

        {store.isDirty && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>

      {/* Right: undo/redo/save + activate/pause */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => store.undo()} disabled={!store.canUndo()} title="Undo">
          <Undo2 size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => store.redo()} disabled={!store.canRedo()} title="Redo">
          <Redo2 size={15} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSave}
          disabled={!store.isDirty || save.isPending}
        >
          <Save size={15} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowExecutions(true)}
          disabled={!store.workflowId}
          title="Execution history"
        >
          <History size={15} />
        </Button>

        {store.workflowStatus === 'active' ? (
          <Button
            size="sm"
            onClick={handlePause}
            disabled={changeStatus.isPending}
            className="bg-black text-white hover:bg-black/90 text-xs"
          >
            {changeStatus.isPending ? 'Pausing...' : 'Pause Automation'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleActivate}
            disabled={changeStatus.isPending || save.isPending}
            className="bg-black text-white hover:bg-black/90 text-xs"
          >
            {changeStatus.isPending ? 'Activating...' : 'Start Automation'}
          </Button>
        )}
      </div>

      {showValidationModal && (
        <ValidationModal
          errors={validationErrors}
          onClose={() => setShowValidationModal(false)}
        />
      )}

      {showExecutions && store.workflowId && (
        <ExecutionsModal
          workflowId={store.workflowId}
          workflowName={store.workflowName}
          onClose={() => setShowExecutions(false)}
        />
      )}
    </div>
  );
}
