import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';

export function DeleteContactForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({ defaultValues });
  const confirmed = useWatch({ control, name: 'confirmed' });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
        This permanently deletes the contact and all their data. This action is irreversible.
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" {...register('confirmed')} className="mt-0.5" />
        <span className="text-sm">I understand this action is irreversible</span>
      </label>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={!confirmed} className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Save
        </button>
      </div>
    </form>
  );
}
