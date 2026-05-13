import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { MoreVertical, AlertTriangle, Copy, Trash2, Pencil } from 'lucide-react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';

export interface HandleConfig {
  type: 'source' | 'target';
  id?: string;
  position: Position;
  style?: React.CSSProperties;
}

interface BaseNodeProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  stepId?: number;
  validated: boolean;
  /** Tailwind classes for the colored header: bg + text + border */
  headerColor: string;
  /** Tailwind ring color for selection: e.g. 'ring-green-400' */
  ringColor: string;
  /** Tailwind border color: e.g. 'border-green-200' */
  borderColor: string;
  children?: React.ReactNode;
  handles: HandleConfig[];
  selected?: boolean;
  nodeType?: string;
  subtype?: string;
}

export function BaseNode({
  id,
  icon,
  label,
  stepId,
  validated,
  headerColor,
  ringColor,
  borderColor,
  children,
  handles,
  selected,
  nodeType,
}: BaseNodeProps) {
  const store = useWorkflowStore();
  const [showMenu, setShowMenu] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(label);
  const menuRef = useRef<HTMLDivElement>(null);
  const { getNodes } = useReactFlow();

  useEffect(() => { setLabelValue(label); }, [label]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // suppress unused warning — getNodes kept for potential future use
  void getNodes;

  const handleRename = () => {
    store.updateNodeLabel(id, labelValue);
    setEditingLabel(false);
    setShowMenu(false);
  };

  const handleDuplicate = () => {
    const node = store.nodes.find((n) => n.id === id);
    if (!node) return;
    store.addNode(node.data.subtype as string, node.type as string, {
      x: node.position.x + 40,
      y: node.position.y + 40,
    });
    setShowMenu(false);
  };

  const handleDelete = () => {
    store.deleteNode(id);
    setShowMenu(false);
  };

  const hasBody = children || (!validated && nodeType !== 'exit' && nodeType !== 'branchLabel');

  return (
    <div
      className={`
        relative w-64 rounded-lg border bg-white shadow-sm cursor-pointer
        ${borderColor}
        ${selected ? `ring-2 ${ringColor} ring-offset-1` : ''}
        transition-shadow hover:shadow-md
      `}
    >
      {/* Handles */}
      {handles.map((h, i) => (
        <Handle
          key={`${h.type}-${h.id ?? i}`}
          type={h.type}
          position={h.position}
          id={h.id}
          style={h.style}
          className="!bg-gray-400 !w-2.5 !h-2.5 !border-2 !border-white"
        />
      ))}

      {/* Colored header */}
      <div className={`flex items-center justify-between px-3 py-2 ${headerColor} ${hasBody ? 'rounded-t-lg' : 'rounded-lg'}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex-shrink-0">{icon}</span>
          {editingLabel ? (
            <input
              autoFocus
              value={labelValue}
              onChange={e => setLabelValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="text-sm font-medium border border-white/60 rounded px-1 py-0.5 w-full bg-white/20 focus:outline-none"
            />
          ) : (
            <span className="text-sm font-medium leading-tight truncate">{label}</span>
          )}
        </div>

        {nodeType !== 'exit' && nodeType !== 'branchLabel' && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
              className="p-0.5 rounded hover:bg-black/10 transition-colors nodrag"
            >
              <MoreVertical size={13} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-50 bg-white border rounded-lg shadow-lg py-1 w-36">
                <button
                  onClick={() => { setEditingLabel(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700"
                >
                  <Pencil size={12} /> Rename
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body: extra content + validation warning */}
      {hasBody && (
        <div className="px-3 py-2">
          {stepId !== undefined && (
            <div className="text-xs text-muted-foreground mb-1">Step #{stepId}</div>
          )}
          {children}
          {!validated && nodeType !== 'exit' && nodeType !== 'branchLabel' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
              <AlertTriangle size={10} className="flex-shrink-0" />
              <span>Define and save this step</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
