import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ChevronRight } from 'lucide-react';
import { PALETTE } from '../utils/nodeRegistry';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Action items split by section per redesign
const MESSAGING_SUBTYPES = new Set(['send_email', 'notify_email', 'call_webhook']);
const INTEGRATION_SUBTYPES = new Set<string>(); // future

function DraggableItem({
  subtype,
  nodeType,
  label,
  onDragStart,
  onClick,
}: {
  subtype: string;
  nodeType: string;
  label: string;
  onDragStart: (e: React.DragEvent, subtype: string, nodeType: string) => void;
  onClick: (subtype: string, nodeType: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, subtype, nodeType)}
      onClick={() => onClick(subtype, nodeType)}
      className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted cursor-grab active:cursor-grabbing transition-colors"
    >
      <span>{label}</span>
      <span className="text-muted-foreground text-xs select-none">⠿</span>
    </div>
  );
}

function CollapsedSection({ label, children }: { label: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <button
        className="flex items-center justify-between w-full px-1 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-md"
        onClick={() => setOpen(v => !v)}
      >
        {label}
        <ChevronRight size={13} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && children}
    </div>
  );
}

export function NodePalette() {
  const store = useWorkflowStore();
  const { screenToFlowPosition } = useReactFlow();

  const onDragStart = (e: React.DragEvent, subtype: string, nodeType: string) => {
    e.dataTransfer.setData('application/workflow-node', JSON.stringify({ subtype, nodeType }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onClickAdd = (subtype: string, nodeType: string) => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    store.addNode(subtype, nodeType, { x: position.x - 100, y: position.y - 40 });
  };

  const triggerItems = PALETTE.triggers;
  const actionItems  = PALETTE.actions;
  const ruleItems    = PALETTE.rules;

  // Split actions into sections
  const contactActions   = actionItems.filter(a => !MESSAGING_SUBTYPES.has(a.subtype) && !INTEGRATION_SUBTYPES.has(a.subtype));
  const messagingActions = actionItems.filter(a => MESSAGING_SUBTYPES.has(a.subtype));

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <Tabs defaultValue="triggers" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="w-full grid grid-cols-3 h-8 flex-shrink-0">
          <TabsTrigger value="triggers" className="text-xs gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            Rules
          </TabsTrigger>
        </TabsList>

        {/* Triggers */}
        <TabsContent value="triggers" className="flex-1 overflow-y-auto mt-3">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed px-1">
            Choose a trigger below, and drag it to the canvas.
          </p>
          <div className="flex flex-col gap-0.5">
            {triggerItems.length > 0 ? triggerItems.map(item => (
              <DraggableItem key={item.subtype} {...item} onDragStart={onDragStart} onClick={onClickAdd} />
            )) : (
              <div className="px-1 py-6 text-center text-xs text-muted-foreground">No steps found</div>
            )}
          </div>
        </TabsContent>

        {/* Actions */}
        <TabsContent value="actions" className="flex-1 overflow-y-auto mt-3">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed px-1">
            Choose an action below, and drag it to the canvas.
          </p>

          {/* Contacts — expanded by default */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-semibold text-foreground">Contacts</span>
              <ChevronRight size={13} className="text-muted-foreground rotate-90" />
            </div>
            <div className="flex flex-col gap-0.5">
              {contactActions.map(item => (
                <DraggableItem key={item.subtype} {...item} onDragStart={onDragStart} onClick={onClickAdd} />
              ))}
            </div>
          </div>

          {/* Messaging Actions — collapsible */}
          <CollapsedSection label="Messaging Actions">
            <div className="flex flex-col gap-0.5">
              {messagingActions.map(item => (
                <DraggableItem key={item.subtype} {...item} onDragStart={onDragStart} onClick={onClickAdd} />
              ))}
            </div>
          </CollapsedSection>

          {/* Integration Actions — collapsible placeholder */}
          <CollapsedSection label="Integration Actions" />

          {actionItems.length === 0 && (
            <div className="px-1 py-6 text-center text-xs text-muted-foreground">No steps found</div>
          )}
        </TabsContent>

        {/* Rules */}
        <TabsContent value="rules" className="flex-1 overflow-y-auto mt-3">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed px-1">
            Choose a rule below, and drag it to the canvas.
          </p>
          <div className="flex flex-col gap-0.5">
            {ruleItems.length > 0 ? ruleItems.map(item => (
              <DraggableItem key={item.subtype} {...item} onDragStart={onDragStart} onClick={onClickAdd} />
            )) : (
              <div className="px-1 py-6 text-center text-xs text-muted-foreground">No steps found</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
