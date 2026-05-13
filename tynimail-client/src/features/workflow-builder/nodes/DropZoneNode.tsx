import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { MiniNodePicker } from '../shared/MiniNodePicker';
import { markDroppedOnZone } from '../utils/dropZoneFlag';

interface DropZoneNodeData {
  parentId: string;
}

export function DropZoneNode({
  data,
  positionAbsoluteX,
  positionAbsoluteY,
}: {
  id: string;
  data: DropZoneNodeData;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
}) {
  const store = useWorkflowStore();
  const { flowToScreenPosition } = useReactFlow();
  const [showPicker, setShowPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Convert flow-space center-top of this node to screen coords for picker placement
  const screenPos = flowToScreenPosition({ x: positionAbsoluteX + 128, y: positionAbsoluteY });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    markDroppedOnZone();
    const raw = e.dataTransfer.getData('application/workflow-node');
    if (!raw) return;
    const { subtype, nodeType } = JSON.parse(raw) as { subtype: string; nodeType: string };
    store.addNodeConnectedTo(data.parentId, subtype, nodeType);
  };

  return (
    <div
      className="nodrag nopan"
      style={{
        width: 256,
        height: 70,
        border: `1.5px dashed ${isDragOver ? '#9CA3AF' : '#CCCCCC'}`,
        borderRadius: 12,
        background: isDragOver ? '#EBEBEB' : '#F4F4F4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={e => {
        e.stopPropagation();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
      onClick={e => {
        e.stopPropagation();
        setShowPicker(v => !v);
      }}
    >
      <span style={{ fontSize: 18, color: '#999999', lineHeight: 1 }}>+</span>
      <span style={{ fontSize: 12, color: '#AAAAAA', textAlign: 'center', padding: '0 12px', lineHeight: 1.4 }}>
        Drag & Drop the nodes from left panel here
      </span>

      {showPicker && (
        <MiniNodePicker
          onPick={(subtype, nodeType) => {
            store.addNodeConnectedTo(data.parentId, subtype, nodeType);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          screenX={screenPos.x}
          screenY={screenPos.y}
        />
      )}
    </div>
  );
}
