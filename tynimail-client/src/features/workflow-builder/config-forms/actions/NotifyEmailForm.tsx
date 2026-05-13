import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function NotifyEmailForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({ defaultValues: { recipientType: 'specific', sender: { name: '', email: '' }, recipientsText: '', recipientAttribute: '', subject: '', body: '', ...defaultValues } });
  const recipientType = useWatch({ control, name: 'recipientType' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sender name <span className="text-red-500">*</span></label>
          <input {...register('sender.name', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sender email <span className="text-red-500">*</span></label>
          <input type="email" {...register('sender.email', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Recipient type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" value="specific" {...register('recipientType')} />
            Specific emails
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" value="attribute" {...register('recipientType')} />
            Contact attribute
          </label>
        </div>
      </div>
      {recipientType === 'specific' ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Recipients (comma-separated) <span className="text-red-500">*</span></label>
          <input {...register('recipientsText', { required: true })} placeholder="email1@example.com, email2@example.com" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Attribute key <span className="text-red-500">*</span></label>
          <input {...register('recipientAttribute', { required: true })} placeholder="e.g. manager_email" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
        <input {...register('subject', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Body <span className="text-red-500">*</span></label>
        <textarea {...register('body', { required: true })} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
