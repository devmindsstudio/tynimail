import { useState, useRef } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { MiniNodePicker } from '../shared/MiniNodePicker';

interface InsertionPointEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  source: string;
  target: string;
}

export function InsertionPointEdge({
  id, sourceX, sourceY, targetX, targetY, source, target,
}: InsertionPointEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const [showPicker, setShowPicker] = useState(false);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const store = useWorkflowStore();
  const { setEdges, flowToScreenPosition } = useReactFlow();

  const screenPos = flowToScreenPosition({ x: labelX, y: labelY });

  const onMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  };
  const onMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(false), 120);
  };

  const onPickNode = (subtype: string, nodeType: string) => {
    store.insertNodeBetween(source, target, subtype, nodeType);
    setShowPicker(false);
  };

  const onDeleteEdge = () => {
    setEdges(eds => eds.filter(e => e.id !== id && !(e.source === source && e.target === target)));
    store.onEdgesChange([{ id, type: 'remove' }]);
    const storeEdge = store.edges.find(e => e.source === source && e.target === target);
    if (storeEdge && storeEdge.id !== id) {
      store.onEdgesChange([{ id: storeEdge.id, type: 'remove' }]);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: '#d1d5db',
          strokeWidth: 3,
          strokeDasharray: '6 4',
          animation: 'dash-flow 0.6s linear infinite',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            position: 'absolute',
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Delete button — absolutely positioned to the left */}
          {hovered && (
            <button
              onClick={onDeleteEdge}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              style={{ position: 'absolute', right: '26px', top: '50%', transform: 'translateY(-50%)' }}
              className="w-5 h-5 rounded-full bg-white border border-red-300 text-red-400 flex items-center justify-center hover:bg-red-50 hover:border-red-500 hover:text-red-600 shadow-sm"
              title="Remove connection"
            >
              <Trash2 size={10} />
            </button>
          )}

          {/* Insert button — always at center */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowPicker(v => !v); }}
            className="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 text-xs shadow-sm"
          >
            +
          </button>

          {showPicker && (
            <MiniNodePicker
              onPick={onPickNode}
              onClose={() => setShowPicker(false)}
              screenX={screenPos.x}
              screenY={screenPos.y}
            />
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { default: InsertionPointEdge, insertion: InsertionPointEdge };
