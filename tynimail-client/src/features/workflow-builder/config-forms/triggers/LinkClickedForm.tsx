import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function LinkClickedForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control } = useForm({ defaultValues });
  const hasCampaignFilter = useWatch({ control, name: '_hasCampaignFilter' });
  const hasUrlFilter = useWatch({ control, name: '_hasUrlFilter' });

  return (
    <form onSubmit={handleSubmit(d => onSave({
      campaignId: d._hasCampaignFilter ? d.campaignId : null,
      urlFilter: d._hasUrlFilter ? d.urlFilter : null,
    }))} className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('_hasCampaignFilter')} />
          <span>Filter by campaign</span>
        </label>
      </div>
      {hasCampaignFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Campaign ID</label>
          <input type="text" {...register('campaignId')} placeholder="Campaign ID" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('_hasUrlFilter')} />
          <span>Filter by URL</span>
        </label>
      </div>
      {hasUrlFilter && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">URL contains</label>
          <input type="text" {...register('urlFilter')} placeholder="e.g. /pricing" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
