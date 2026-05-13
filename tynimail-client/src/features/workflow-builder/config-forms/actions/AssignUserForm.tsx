import { useForm, useWatch } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { useTeamMembers } from '../../hooks/useWorkflowApi';
import { FormFooter } from '../FormFooter';

export function AssignUserForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({ defaultValues: { assignmentType: 'specific', userId: '', userIds: [] as string[], ...defaultValues } });
  const assignmentType = useWatch({ control, name: 'assignmentType' });
  const { data: members = [] } = useTeamMembers();

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Assignment type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" value="specific" {...register('assignmentType')} />
            Specific user
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" value="round_robin" {...register('assignmentType')} />
            Round robin
          </label>
        </div>
      </div>
      {assignmentType === 'specific' ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">User <span className="text-red-500">*</span></label>
          <select {...register('userId', { required: 'User is required' })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400">
            <option value="">Select user...</option>
            {(members as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.name ?? m.email}</option>)}
          </select>
          {errors.userId && <p className="text-xs text-red-500 mt-1">{String(errors.userId.message)}</p>}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Users (round robin) <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-2">Hold Ctrl/Cmd to select multiple.</p>
          <select multiple {...register('userIds', { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400 h-28">
            {(members as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.name ?? m.email}</option>)}
          </select>
        </div>
      )}
      <FormFooter onCancel={onCancel} />
    </form>
  );
}
