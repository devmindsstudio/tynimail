interface DurationValue {
  months: number;
  days: number;
  hours: number;
  minutes: number;
}

interface DurationPickerProps {
  value: DurationValue;
  onChange: (value: DurationValue) => void;
  error?: string;
}

const UNITS: (keyof DurationValue)[] = ['months', 'days', 'hours', 'minutes'];

export function DurationPicker({ value, onChange, error }: DurationPickerProps) {
  const update = (unit: keyof DurationValue, v: number) => {
    onChange({ ...value, [unit]: Math.max(0, v) });
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {UNITS.map(unit => (
          <div key={unit} className="text-center">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => update(unit, value[unit] - 1)}
                className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 text-sm border-r"
              >
                &#9660;
              </button>
              <input
                type="number"
                min={0}
                value={value[unit]}
                onChange={e => update(unit, Number(e.target.value))}
                className="w-full text-center text-sm py-1.5 outline-none"
              />
              <button
                type="button"
                onClick={() => update(unit, value[unit] + 1)}
                className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 text-sm border-l"
              >
                &#9650;
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 capitalize">{unit}</div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
