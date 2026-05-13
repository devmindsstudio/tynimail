import React from 'react';
import { Position } from '@xyflow/react';
import { Zap, UserPlus, UserMinus, Filter, Users, CalendarHeart, FileText, MailOpen, MousePointerClick, MailX, Globe, Sparkles } from 'lucide-react';
import { BaseNode } from './BaseNode';

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  contact_added_to_list:     <UserPlus size={14} />,
  contact_removed_from_list: <UserMinus size={14} />,
  contact_matches_filter:    <Filter size={14} />,
  contact_in_segment:        <Users size={14} />,
  anniversary:               <CalendarHeart size={14} />,
  form_submitted:            <FileText size={14} />,
  email_opened:              <MailOpen size={14} />,
  link_clicked:              <MousePointerClick size={14} />,
  unsubscribed:              <MailX size={14} />,
  webpage_visited:           <Globe size={14} />,
  custom_event:              <Sparkles size={14} />,
};

export function TriggerNode({ id, data, selected }: any) {
  return (
    <BaseNode
      id={id}
      icon={TRIGGER_ICONS[data.subtype] ?? <Zap size={14} />}
      label={data.label}
      stepId={data.stepId}
      validated={data.validated}
      headerColor="bg-green-100 text-green-800"
      ringColor="ring-green-400"
      borderColor="border-green-200"
      nodeType="trigger"
      subtype={data.subtype}
      selected={selected}
      handles={[{ type: 'source', position: Position.Bottom }]}
    />
  );
}
