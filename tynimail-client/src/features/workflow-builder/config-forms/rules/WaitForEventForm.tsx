import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

const EVENT_TYPES = [
  { value: 'email_opened', label: 'Email opened' },
  { value: 'link_clicked', label: 'Link clicked' },
  { value: 'form_submitted', label: 'Form submitted' },
  { value: 'custom_event', label: 'Custom event' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
];

export function WaitForEventForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { eventType: '', eventConfig: { eventName: '', urlFilter: '' }, waitTime: { months: 0, days: 7, hours: 0, minutes: 0 }, ...defaultValues },
  });
  const eventType = useWatch({ control, name: 'eventType' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Wait for event <span className="text-red-500">*</span></label>
        <select {...register('eventType', { required: 'Event type is required' })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">Select event...</option>
          {EVENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        {errors.eventType && <p className="text-xs text-red-500 mt-1">{String(errors.eventType.message)}</p>}
      </div>
      {eventType === 'custom_event' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Event name <span className="text-red-500">*</span></label>
          <input {...register('eventConfig.eventName', { required: true })} placeholder="e.g. purchase_completed" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      {eventType === 'link_clicked' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">URL filter (optional)</label>
          <input {...register('eventConfig.urlFilter')} placeholder="URL contains..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Maximum wait time</label>
        <div className="grid grid-cols-4 gap-2">
          {(['months', 'days', 'hours', 'minutes'] as const).map(unit => (
            <div key={unit} className="text-center">
              <input type="number" min={0} {...register(`waitTime.${unit}`, { valueAsNumber: true })} className="w-full border rounded-lg px-2 py-2 text-sm text-center outline-none focus:ring-1 focus:ring-blue-400" />
              <div className="text-xs text-gray-500 mt-1 capitalize">{unit}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">After this time, contacts take the "No" path.</p>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
