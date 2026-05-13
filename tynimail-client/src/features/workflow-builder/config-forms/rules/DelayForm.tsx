import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function DelayForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit } = useForm({ defaultValues: { months: 0, days: 0, hours: 0, minutes: 0, ...defaultValues } });

  return (
    <form onSubmit={handleSubmit((d) => {
      if (d.months + d.days + d.hours + d.minutes === 0) return;
      onSave(d);
    })} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Delay duration</label>
        <div className="grid grid-cols-4 gap-2">
          {(['months', 'days', 'hours', 'minutes'] as const).map(unit => (
            <div key={unit} className="text-center">
              <input
                type="number"
                min={0}
                {...register(unit, { valueAsNumber: true, min: 0 })}
                className="w-full border rounded-lg px-2 py-2 text-sm text-center outline-none focus:ring-1 focus:ring-blue-400"
              />
              <div className="text-xs text-gray-500 mt-1 capitalize">{unit}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">At least one field must be greater than 0.</p>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
