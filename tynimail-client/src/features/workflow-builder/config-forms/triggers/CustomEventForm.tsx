import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ConfigFormProps } from '../../components/NodeConfigPanel';
import { FormFooter } from '../FormFooter';
import { ElementRulesManager } from './ElementRulesManager';

export function CustomEventForm({ defaultValues, onSave, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  // Local state — more reliable than useWatch for sibling rendering, avoids accidental form submit
  const [eventName, setEventName] = useState<string>(defaultValues?.eventName ?? '');

  // Capture the RHF registration so we can call both handlers in onChange
  const eventNameReg = register('eventName', { required: 'Event name is required' });

  return (
    <>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Event name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...eventNameReg}
            placeholder="e.g. purchase_completed"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
            onChange={e => {
              eventNameReg.onChange(e); // keep RHF internal state in sync (required for correct form submission)
              setEventName(e.target.value);
            }}
          />
          {errors.eventName && (
            <p className="text-xs text-red-500 mt-1">{String(errors.eventName.message)}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">The name of the custom event to listen for.</p>
        </div>
        <FormFooter onCancel={onCancel} />
      </form>

      {/* Element tracking rules — outside the form to prevent accidental submit on Enter */}
      {eventName.trim() && (
        <div className="border-t border-border pt-4 mt-2">
          <ElementRulesManager eventName={eventName.trim()} />
        </div>
      )}
    </>
  );
}
