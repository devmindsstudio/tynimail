import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { SegmentSelect } from '../SegmentSelect';
import { FormFooter } from '../FormFooter';

export function RemoveFromListForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <SegmentSelect
        registration={register('listId', { required: 'Segment is required' })}
        error={errors.listId ? String(errors.listId.message) : undefined}
      />
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
