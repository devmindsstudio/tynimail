import { createPortal } from 'react-dom';
import { PALETTE } from '../utils/nodeRegistry';

export interface MiniNodePickerProps {
  onPick: (subtype: string, nodeType: string) => void;
  onClose: () => void;
  screenX: number;
  screenY: number;
}

export function MiniNodePicker({ onPick, onClose, screenX, screenY }: MiniNodePickerProps) {
  const allItems = [
    ...PALETTE.actions.map(i => ({ ...i, section: 'Actions' })),
    ...PALETTE.rules.map(i => ({ ...i, section: 'Rules' })),
  ];

  return createPortal(
    <>
      {/* Backdrop to close on outside click */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] w-56 bg-white border border-gray-200 rounded-xl shadow-xl text-xs"
        style={{ left: screenX - 112, top: screenY - 8, transform: 'translateY(-100%)' }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-medium text-gray-700">Insert step</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {['Actions', 'Rules'].map(section => (
            <div key={section}>
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{section}</div>
              {allItems
                .filter(i => i.section === section)
                .map(item => (
                  <button
                    key={item.subtype}
                    onClick={() => onPick(item.subtype, item.nodeType)}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}
