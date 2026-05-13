import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function FormSubmittedForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Form ID (optional)</label>
        <input type="text" {...register('formId')} placeholder="Leave blank to match any form" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        <p className="text-xs text-gray-400 mt-1">Fires when any form is submitted, or a specific form by ID.</p>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
