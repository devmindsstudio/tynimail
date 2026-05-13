interface ValidationModalProps {
  errors: string[];
  onClose: () => void;
}

export function ValidationModal({ errors, onClose }: ValidationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500 text-xl">&#9888;</span>
          <h2 className="font-semibold text-lg">Cannot activate workflow</h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">Fix these issues before activating:</p>
        <ul className="space-y-1 mb-6">
          {errors.map((e, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-red-500 mt-0.5">&#8226;</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
        >
          Close and fix
        </button>
      </div>
    </div>
  );
}
