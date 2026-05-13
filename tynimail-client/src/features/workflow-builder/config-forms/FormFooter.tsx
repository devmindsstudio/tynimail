interface FormFooterProps {
  onCancel: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export function FormFooter({ onCancel, submitLabel = 'Save', disabled = false }: FormFooterProps) {
  return (
    <div className="flex gap-2 pt-4 mt-4 border-t border-border bg-white">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-10 px-3 text-sm border border-border rounded-md bg-white text-foreground hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="flex-1 h-10 px-3 text-sm bg-black text-white rounded-md hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitLabel}
      </button>
    </div>
  );
}
