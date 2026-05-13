import { useForm, Controller } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';
import { FilterBuilder } from '../../shared/FilterBuilder';
import type { FilterConfig } from '../../shared/FilterBuilder';
import { useContactAttributes } from '../../hooks/useWorkflowApi';

export function ContactMatchesFilterForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { filters: null, entryTime: '09:00', timezone: 'UTC', ...defaultValues },
  });

  const { data: attributes = [] } = useContactAttributes();
  const customFields = attributes.map((a: any) => ({
    key: `attributes.${a.key ?? a.name}`,
    label: `Attribute: ${a.label ?? a.name ?? a.key}`,
    type: a.type ?? 'string',
  }));

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Filter conditions</label>
        <Controller
          name="filters"
          control={control}
          render={({ field }) => (
            <FilterBuilder
              value={field.value as FilterConfig | null}
              onChange={field.onChange}
              fields={customFields}
            />
          )}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Daily check time <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          {...register('entryTime', { required: true })}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Contacts matching the conditions above will enter this workflow once daily at this time.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
        <select
          {...register('timezone')}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
        </select>
      </div>

      <FormFooter onCancel={onCancel} />
    </form>
  );
}
