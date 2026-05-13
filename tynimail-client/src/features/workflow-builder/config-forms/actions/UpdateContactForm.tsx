import { useForm, useFieldArray } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { useContactAttributes } from '../../hooks/useWorkflowApi';
import { FormFooter } from '../FormFooter';

export function UpdateContactForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { control, register, handleSubmit } = useForm({
    defaultValues: { attributes: [{ field: '', value: '' }], ...defaultValues },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' });
  const { data: attrData } = useContactAttributes();
  const attributes = Array.isArray(attrData) ? attrData : [];

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Attributes to update</label>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <select {...register(`attributes.${i}.field`, { required: true })} className="w-2/5 border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400">
                <option value="">Field...</option>
                <option value="first_name">First name</option>
                <option value="last_name">Last name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                {attributes.filter((a: any) => !['first_name','last_name','email','phone'].includes(a.key ?? a)).map((a: any) => (
                  <option key={a.key ?? a} value={a.key ?? a}>{a.label ?? a.key ?? a}</option>
                ))}
              </select>
              <input {...register(`attributes.${i}.value`, { required: true })} placeholder="New value" className="flex-1 border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400" />
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 px-1 text-xs">&#x2715;</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => append({ field: '', value: '' })} className="mt-2 text-xs text-blue-600 hover:underline">+ Add field</button>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
