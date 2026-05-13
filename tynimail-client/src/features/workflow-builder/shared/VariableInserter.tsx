import { useState, useRef } from 'react';

interface VariableInserterProps {
  onInsert: (variable: string) => void;
}

const STANDARD_VARIABLES = [
  { label: 'First Name', value: '{{contact.firstName}}', group: 'Contact' },
  { label: 'Last Name', value: '{{contact.lastName}}', group: 'Contact' },
  { label: 'Email', value: '{{contact.email}}', group: 'Contact' },
  { label: 'Workflow Name', value: '{{workflow.name}}', group: 'Workflow' },
];

export function VariableInserter({ onInsert }: VariableInserterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const groups = STANDARD_VARIABLES.reduce<Record<string, typeof STANDARD_VARIABLES>>((acc, v) => {
    if (!acc[v.group]) acc[v.group] = [];
    acc[v.group].push(v);
    return acc;
  }, {});

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        title="Insert variable"
        className="px-2 py-1.5 border rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-mono"
      >
        {'{{ }}'}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border rounded-xl shadow-xl text-xs">
          {Object.entries(groups).map(([group, vars]) => (
            <div key={group}>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b">
                {group}
              </div>
              {vars.map(v => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => { onInsert(v.value); setOpen(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                >
                  {v.label}
                  <span className="block text-gray-400 font-mono text-[10px]">{v.value}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
