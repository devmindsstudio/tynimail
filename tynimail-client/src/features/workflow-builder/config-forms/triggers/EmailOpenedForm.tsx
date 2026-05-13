import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function EmailOpenedForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({ defaultValues });
  const hasFilter = useWatch({ control, name: '_hasCampaignFilter' });

  return (
    <form onSubmit={handleSubmit(d => onSave({ campaignId: d._hasCampaignFilter ? d.campaignId : null }))} className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('_hasCampaignFilter')} />
          <span>Filter by specific campaign</span>
        </label>
      </div>
      {hasFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Campaign ID</label>
          <input type="text" {...register('campaignId')} placeholder="Campaign ID" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
