import { useNavigate } from 'react-router';
import { useSegments, useSaveWorkflow } from '../hooks/useWorkflowApi';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import toast from 'react-hot-toast';

interface SegmentSelectProps {
  registration: ReturnType<import('react-hook-form').UseFormRegister<any>>;
  error?: string;
}

export function SegmentSelect({ registration, error }: SegmentSelectProps) {
  const { data: segData } = useSegments();
  const segments = segData?.data ?? [];
  const navigate = useNavigate();
  const store = useWorkflowStore();
  const save = useSaveWorkflow(store.workflowId ?? '');

  const handleCreateSegment = async () => {
    try {
      await save.mutateAsync({
        name: store.workflowName,
        flow_data: store.toFlowData(),
        triggers: store.toTriggersArray(),
      });
      store.markSaved();
      toast.success('Workflow saved');
    } catch {
      toast.error('Failed to save workflow before leaving');
      return;
    }
    navigate('/subscribers/segments');
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Segment <span className="text-red-500">*</span>
      </label>
      <select
        {...registration}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
      >
        <option value="">Select a segment...</option>
        {segments.map((s: any) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <button
        type="button"
        onClick={handleCreateSegment}
        disabled={save.isPending}
        className="mt-1.5 text-xs text-blue-600 hover:underline disabled:opacity-50"
      >
        {save.isPending ? 'Saving...' : '+ Create new segment'}
      </button>
    </div>
  );
}
