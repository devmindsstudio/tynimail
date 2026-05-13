import { useCallback, useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, useReactFlow, BackgroundVariant, type Node, Panel } from '@xyflow/react';
import { Search } from 'lucide-react';
import { nodeTypes, PALETTE } from '../utils/nodeRegistry';
import { edgeTypes } from './InsertionPointEdge';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { Input } from '@/components/ui/input';
import { consumeDroppedOnZone } from '../utils/dropZoneFlag';

const ALL_ITEMS = [...PALETTE.triggers, ...PALETTE.actions, ...PALETTE.rules];

// These node types should never have a drop zone computed below them
const EXCLUDED_FROM_DANGLING = new Set([
  'exit', 'branchLabel', 'dropZone',
  'conditionalSplit', 'percentageSplit', 'waitForEvent',
]);

export function Canvas() {
  const store = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();
  const [search, setSearch] = useState('');

  const results = search.trim()
    ? ALL_ITEMS.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  // Compute virtual dropZone nodes synchronously — no useState/useEffect lag
  const displayNodes = useMemo<Node[]>(() => {
    const nodesWithOutgoing = new Set(store.edges.map(e => e.source));
    const dropZones: Node[] = store.nodes
      .filter(n => !EXCLUDED_FROM_DANGLING.has(n.type ?? '') && !nodesWithOutgoing.has(n.id))
      .map(n => ({
        id: `dropzone-${n.id}`,
        type: 'dropZone',
        position: { x: n.position.x, y: n.position.y + 120 },
        data: { parentId: n.id },
        draggable: false,
        selectable: false,
        connectable: false,
        focusable: false,
      }));
    return [...store.nodes, ...dropZones];
  }, [store.nodes, store.edges]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      // If the drop was already handled by a DropZoneNode, skip free placement
      if (consumeDroppedOnZone()) return;
      const raw = e.dataTransfer.getData('application/workflow-node');
      if (!raw) return;
      const { subtype, nodeType } = JSON.parse(raw);
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      store.addNode(subtype, nodeType, position);
    },
    [screenToFlowPosition, store],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'exit' || node.type === 'branchLabel' || node.type === 'dropZone') return;
      store.setSelectedNode(node.id);
      store.setPanelMode('config');
    },
    [store],
  );

  // Filter out changes for virtual dropZone nodes — they are not in the store
  const onNodesChange = useCallback(
    (changes: any[]) => {
      const filtered = changes.filter(c => !String(c.id ?? '').startsWith('dropzone-'));
      if (filtered.length) store.onNodesChange(filtered);
    },
    [store],
  );

  const onPaneClick = useCallback(() => {
    store.setSelectedNode(null);
    store.setPanelMode('palette');
  }, [store]);

  const handleResultClick = (subtype: string, nodeType: string) => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    store.addNode(subtype, nodeType, { x: position.x - 100, y: position.y - 40 });
    setSearch('');
  };

  return (
    <ReactFlow
      nodes={displayNodes}
      edges={store.edges}
      onNodesChange={onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={store.onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ maxZoom: 0.85, padding: 0.2 }}
      snapToGrid
      snapGrid={[16, 16]}
      deleteKeyCode={null}
      defaultEdgeOptions={{
        type: 'insertion',
        animated: false,
        style: {
          stroke: '#d1d5db',
          strokeWidth: 3,
          strokeDasharray: '6 4',
          animation: 'dash-flow 0.6s linear infinite',
        },
      }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={4} color="#e5e7eb" />
      <Controls
        className="!bottom-4 !right-4 !left-auto !top-auto !shadow-sm"
        showInteractive={false}
      />

      {/* Floating search — top left of canvas */}
      <Panel position="top-left" className="mt-4 ml-4">
        <div className="relative w-52">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setSearch('')}
            placeholder="Search nodes..."
            className="pl-8 h-8 text-xs bg-white shadow-sm"
          />
          {results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-full bg-white border border-border rounded-md shadow-md z-50 overflow-hidden">
              {results.map(item => (
                <button
                  key={item.subtype}
                  onClick={() => handleResultClick(item.subtype, item.nodeType)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </ReactFlow>
  );
}
