import { useLists } from '../hooks/useWorkflowApi';

interface ListSelectorProps {
  value: string | null;
  onChange: (listId: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function ListSelector({ value, onChange, placeholder = 'Select a list...', required }: ListSelectorProps) {
  const { data: listsData, isLoading } = useLists();
  const lists = listsData?.data ?? [];

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      required={required}
      className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-400"
    >
      <option value="">{isLoading ? 'Loading...' : placeholder}</option>
      {lists.map((l: any) => (
        <option key={l.id} value={l.id}>{l.name}</option>
      ))}
    </select>
  );
}
