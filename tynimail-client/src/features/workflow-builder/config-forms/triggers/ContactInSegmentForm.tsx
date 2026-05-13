import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { useSegments } from '../../hooks/useWorkflowApi';
import { FormFooter } from '../FormFooter';

export function ContactInSegmentForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { segmentId: '', entryTime: '09:00', timezone: 'UTC', ...defaultValues } });
  const { data: segData } = useSegments();
  const segments = segData?.data ?? [];

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Segment <span className="text-red-500">*</span></label>
        <select {...register('segmentId', { required: 'Segment is required' })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">Select a segment...</option>
          {segments.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {errors.segmentId && <p className="text-xs text-red-500 mt-1">{String(errors.segmentId.message)}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Daily entry time</label>
        <input type="time" {...register('entryTime')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
        <select {...register('timezone')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
        </select>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
