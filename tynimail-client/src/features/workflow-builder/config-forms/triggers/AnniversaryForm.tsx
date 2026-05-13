import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function AnniversaryForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({ defaultValues: { dateAttribute: '', timing: 'same_day', entryTime: '09:00', timezone: 'UTC', offset: 0, ...defaultValues } });
  const timing = useWatch({ control, name: 'timing' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Date attribute <span className="text-red-500">*</span></label>
        <select {...register('dateAttribute', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">Select...</option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Timing</label>
        <div className="space-y-1">
          {['same_day', 'before', 'after'].map(t => (
            <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value={t} {...register('timing')} />
              <span className="capitalize">{t.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
      {(timing === 'before' || timing === 'after') && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Offset (days)</label>
          <input type="number" min={1} {...register('offset', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Entry time</label>
        <input type="time" {...register('entryTime')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
        <select {...register('timezone')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
