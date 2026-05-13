import React from 'react';
import { Position } from '@xyflow/react';
import { Mail, BellRing, Webhook, ListPlus, ListMinus, UserCog, Ban, UserCheck, Trash2, Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  send_email:        <Mail size={14} />,
  notify_email:      <BellRing size={14} />,
  call_webhook:      <Webhook size={14} />,
  add_to_list:       <ListPlus size={14} />,
  remove_from_list:  <ListMinus size={14} />,
  update_contact:    <UserCog size={14} />,
  blocklist_contact: <Ban size={14} />,
  assign_user:       <UserCheck size={14} />,
  delete_contact:    <Trash2 size={14} />,
};

export function ActionNode({ id, data, selected }: any) {
  return (
    <BaseNode
      id={id}
      icon={ACTION_ICONS[data.subtype] ?? <Zap size={14} />}
      label={data.label}
      stepId={data.stepId}
      validated={data.validated}
      headerColor="bg-purple-100 text-purple-800"
      ringColor="ring-purple-400"
      borderColor="border-purple-200"
      nodeType="action"
      subtype={data.subtype}
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom },
      ]}
    />
  );
}
