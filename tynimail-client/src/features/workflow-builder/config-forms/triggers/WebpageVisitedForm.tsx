import { useForm, useFieldArray } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function WebpageVisitedForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      conditions: defaultValues?.websiteFilters?.conditions ?? [{ operator: 'contains', value: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'conditions' });

  return (
    <form onSubmit={handleSubmit(d => onSave({ websiteFilters: { conditions: d.conditions } }))} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">URL conditions</label>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <select {...register(`conditions.${i}.operator`)} className="border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400">
                <option value="contains">contains</option>
                <option value="equals">equals</option>
                <option value="starts_with">starts with</option>
              </select>
              <input {...register(`conditions.${i}.value`, { required: true })} placeholder="URL or pattern" className="flex-1 border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400" />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 px-1">&#x2715;</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => append({ operator: 'contains', value: '' })} className="mt-2 text-xs text-blue-600 hover:underline">+ Add URL filter</button>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
