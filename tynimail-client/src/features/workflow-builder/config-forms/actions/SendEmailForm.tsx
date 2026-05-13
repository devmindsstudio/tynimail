import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { useEmailTemplates } from '../../hooks/useWorkflowApi';
import { FormFooter } from '../FormFooter';

export function SendEmailForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  const { data: tplData } = useEmailTemplates();
  const templates = tplData?.data ?? [];

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Email template <span className="text-red-500">*</span></label>
        <select {...register('templateId', { required: 'Template is required' })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">Select template...</option>
          {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {errors.templateId && <p className="text-xs text-red-500 mt-1">{String(errors.templateId.message)}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Subject line <span className="text-red-500">*</span></label>
        <input {...register('subject', { required: 'Subject is required' })} placeholder="Email subject..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        {errors.subject && <p className="text-xs text-red-500 mt-1">{String(errors.subject.message)}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Preview text</label>
        <input {...register('previewText')} placeholder="Preview text..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sender name <span className="text-red-500">*</span></label>
          <input {...register('fromName', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sender email <span className="text-red-500">*</span></label>
          <input type="email" {...register('fromEmail', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Reply-to email</label>
        <input type="email" {...register('replyTo')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
