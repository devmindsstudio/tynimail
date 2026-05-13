import { useForm, useFieldArray } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';

export function PercentageSplitForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const defaultBranches = defaultValues?.branches ?? [
    { id: 'branch_a', name: 'Branch A', percentage: 50 },
    { id: 'branch_b', name: 'Branch B', percentage: 50 },
  ];
  const { control, register, handleSubmit, watch } = useForm({ defaultValues: { branches: defaultBranches } });
  const { fields, append, remove } = useFieldArray({ control, name: 'branches' });
  const branches = watch('branches') ?? [];
  const total = branches.reduce((sum: number, b: any) => sum + (Number(b.percentage) || 0), 0);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Total must equal 100%</span>
        <span className={total === 100 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{total}%</span>
      </div>
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-center gap-2">
          <input {...register(`branches.${i}.name`)} className="flex-1 border rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-400" placeholder="Branch name" />
          <input type="number" min={0} max={100} {...register(`branches.${i}.percentage`, { valueAsNumber: true })} className="w-20 border rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:ring-1 focus:ring-blue-400" />
          <span className="text-xs text-gray-500">%</span>
          {fields.length > 2 && (
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 text-xs">&#x2715;</button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ id: `branch_${String.fromCharCode(97 + fields.length)}`, name: `Branch ${String.fromCharCode(65 + fields.length)}`, percentage: 0 })}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add branch
      </button>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={total !== 100} className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Save
        </button>
      </div>
    </form>
  );
}
