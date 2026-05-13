import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, Connection, XYPosition } from '@xyflow/react';
import { getNodeDefaults } from '../utils/nodeDefaults';

interface WorkflowMeta {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

interface WorkflowStore {
  workflowId: string | null;
  workflowName: string;
  workflowStatus: 'draft' | 'active' | 'paused' | 'archived';
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  panelMode: 'palette' | 'config';
  nextStepId: number;
  isDirty: boolean;
  lastSavedAt: Date | null;

  // History
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (subtype: string, nodeType: string, position: XYPosition) => void;
  addNodeConnectedTo: (parentId: string, subtype: string, nodeType: string) => void;
  insertNodeBetween: (sourceId: string, targetId: string, subtype: string, nodeType: string) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, any>, validated: boolean) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setPanelMode: (mode: 'palette' | 'config') => void;
  setWorkflowName: (name: string) => void;
  setWorkflowStatus: (status: 'draft' | 'active' | 'paused' | 'archived') => void;
  markSaved: () => void;

  fromFlowData: (data: { nodes: Node[]; edges: Edge[] }, meta: WorkflowMeta) => void;
  toFlowData: () => { nodes: Node[]; edges: Edge[] };
  toTriggersArray: () => any[];
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowId: null,
  workflowName: 'Untitled Automation',
  workflowStatus: 'draft',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  panelMode: 'palette',
  nextStepId: 1,
  isDirty: false,
  lastSavedAt: null,
  past: [],
  future: [],

  // ── History ────────────────────────────────────────────────────────────────

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future].slice(0, 50),
      nodes: prev.nodes,
      edges: prev.edges,
      isDirty: true,
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
      isDirty: true,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  // ── React Flow callbacks ───────────────────────────────────────────────────

  onNodesChange: (changes) => {
    const isStructural = changes.some((c) => c.type === 'add' || c.type === 'remove');
    if (isStructural) {
      const { nodes, edges, past } = get();
      set({ past: [...past, { nodes, edges }].slice(-50), future: [] });
    }
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: state.isDirty || isStructural,
    }));
  },

  onEdgesChange: (changes) => {
    const hasRemove = changes.some((c) => c.type === 'remove');
    if (hasRemove) {
      const { nodes, edges, past } = get();
      set({ past: [...past, { nodes, edges }].slice(-50), future: [] });
    }
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true,
    }));
  },

  onConnect: (connection) => {
    set((state) => {
      const targetNode = state.nodes.find((n) => n.id === connection.target);
      if (targetNode?.type === 'trigger' || targetNode?.type === 'dropZone') return state;
      const sourceNode = state.nodes.find((n) => n.id === connection.source);
      if (sourceNode?.type === 'exit') return state;
      return {
        past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-50),
        future: [],
        edges: addEdge({ ...connection, type: 'insertion' }, state.edges),
        isDirty: true,
      };
    });
  },

  // ── Node mutations ─────────────────────────────────────────────────────────

  addNode: (subtype, nodeType, position) => {
    const { nextStepId, nodes, edges, past } = get();
    const id = `${nodeType}-${Date.now()}`;
    const { defaultLabel, defaultConfig } = getNodeDefaults(subtype);
    const newNode: Node = {
      id,
      type: nodeType,
      position,
      data: {
        stepId: nextStepId,
        subtype,
        label: defaultLabel,
        config: defaultConfig,
        validated: false,
      },
    };
    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...nodes, newNode],
      nextStepId: nextStepId + 1,
      isDirty: true,
    });
  },

  addNodeConnectedTo: (parentId, subtype, nodeType) => {
    const { nodes, edges, nextStepId, past } = get();
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode || parentNode.type === 'exit') return;
    const id = `${nodeType}-${Date.now()}`;
    const { defaultLabel, defaultConfig } = getNodeDefaults(subtype);
    const newNode: Node = {
      id,
      type: nodeType,
      position: { x: parentNode.position.x, y: parentNode.position.y + 160 },
      data: { stepId: nextStepId, subtype, label: defaultLabel, config: defaultConfig, validated: false },
    };
    const newEdge: Edge = {
      id: `e-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'insertion',
      animated: false,
      style: { stroke: '#d1d5db', strokeDasharray: '5 5', strokeWidth: 1.5 },
    };
    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...nodes, newNode],
      edges: [...edges, newEdge],
      nextStepId: nextStepId + 1,
      isDirty: true,
    });
  },

  insertNodeBetween: (sourceId, targetId, subtype, nodeType) => {
    const { nodes, edges, nextStepId, past } = get();
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return;

    const position = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2 + 80,
    };

    const id = `${nodeType}-${Date.now()}`;
    const { defaultLabel, defaultConfig } = getNodeDefaults(subtype);
    const newNode: Node = {
      id,
      type: nodeType,
      position,
      data: { stepId: nextStepId, subtype, label: defaultLabel, config: defaultConfig, validated: false },
    };

    const oldEdge = edges.find((e) => e.source === sourceId && e.target === targetId);
    const newEdges = edges.filter((e) => e !== oldEdge);
    newEdges.push({ id: `e-${sourceId}-${id}`, type: 'insertion', source: sourceId, target: id, sourceHandle: oldEdge?.sourceHandle });
    newEdges.push({ id: `e-${id}-${targetId}`, type: 'insertion', source: id, target: targetId });

    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: [],
      nodes: [...nodes, newNode],
      edges: newEdges,
      nextStepId: nextStepId + 1,
      isDirty: true,
    });
  },

  updateNodeConfig: (nodeId, config, validated) => {
    const { nodes, edges, past } = get();
    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: [],
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config, validated } } : n
      ),
      isDirty: true,
    });
  },

  updateNodeLabel: (nodeId, label) => {
    const { nodes, edges, past } = get();
    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: [],
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
      isDirty: true,
    });
  },

  deleteNode: (nodeId) => {
    const { nodes, edges, past } = get();
    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const incoming = edges.filter((e) => e.target === nodeId);
    const outgoing = edges.filter((e) => e.source === nodeId);
    let newEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    if (incoming.length === 1 && outgoing.length === 1) {
      newEdges.push({
        id: `e-${incoming[0].source}-${outgoing[0].target}`,
        type: 'insertion',
        source: incoming[0].source,
        target: outgoing[0].target,
        sourceHandle: incoming[0].sourceHandle,
      });
    }
    set({
      past: [...past, { nodes, edges }].slice(-50),
      future: [],
      nodes: newNodes,
      edges: newEdges,
      isDirty: true,
    });
  },

  // ── Non-tracked setters ────────────────────────────────────────────────────

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setPanelMode: (mode) => set({ panelMode: mode }),
  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),
  setWorkflowStatus: (status) => set({ workflowStatus: status }),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),

  // ── Serialization ──────────────────────────────────────────────────────────

  fromFlowData: (data, meta) => {
    const maxStepId = data.nodes.reduce((max, n) => Math.max(max, (n.data?.stepId as number) ?? 0), 0);
    set({
      workflowId: meta.id,
      workflowName: meta.name,
      workflowStatus: meta.status as 'draft' | 'active' | 'paused' | 'archived',
      nodes: data.nodes,
      edges: data.edges.map((e) => ({ ...e, type: 'insertion' })),
      nextStepId: maxStepId + 1,
      isDirty: false,
      lastSavedAt: new Date(meta.updatedAt),
      selectedNodeId: null,
      panelMode: 'palette',
      past: [],
      future: [],
    });
  },

  toFlowData: () => {
    const { nodes, edges } = get();
    return { nodes: nodes.filter(n => n.type !== 'dropZone'), edges };
  },

  toTriggersArray: () => {
    const { nodes } = get();
    return nodes
      .filter((n) => n.type === 'trigger')
      .map((n) => ({
        nodeId: n.id,
        type: 'trigger',
        subtype: n.data.subtype,
        config: n.data.config ?? {},
      }));
  },
}));
