import type { ConfigFormProps } from '../../components/NodeConfigPanel';

export function UnsubscribedForm({ onSave, onCancel }: ConfigFormProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-1">Unsubscribed trigger</p>
        <p>Fires when a contact unsubscribes from emails.</p>
        <p className="mt-2 text-gray-400 text-xs">No configuration required.</p>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="button" onClick={() => onSave({})} className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Done</button>
      </div>
    </div>
  );
}
