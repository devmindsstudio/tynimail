import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';

export function BlocklistContactForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit } = useForm({ defaultValues: { blockType: 'marketing', ...defaultValues } });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Block type <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {[
            { value: 'marketing', label: 'Block marketing emails only' },
            { value: 'all', label: 'Block all emails' },
            { value: 'compliance', label: 'Block transactional only' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value={opt.value} {...register('blockType')} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
