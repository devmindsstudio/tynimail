import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function CallWebhookForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { url: '', includeContactDetails: true, includeTriggerEvent: false, ...defaultValues } });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Webhook URL <span className="text-red-500">*</span></label>
        <input
          type="url"
          {...register('url', { required: 'URL is required', pattern: { value: /^https?:\/\//, message: 'Must start with http:// or https://' } })}
          placeholder="https://example.com/webhook"
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
        />
        {errors.url && <p className="text-xs text-red-500 mt-1">{String(errors.url.message)}</p>}
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('includeContactDetails')} />
          <span>Include contact details in payload</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('includeTriggerEvent')} />
          <span>Include trigger event data in payload</span>
        </label>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
