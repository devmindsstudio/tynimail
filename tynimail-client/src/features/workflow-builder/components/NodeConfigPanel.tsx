import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { Button } from '@/components/ui/button';

// Trigger forms
import { ContactAddedToListForm } from '../config-forms/triggers/ContactAddedToListForm';
import { ContactRemovedFromListForm } from '../config-forms/triggers/ContactRemovedFromListForm';
import { ContactMatchesFilterForm } from '../config-forms/triggers/ContactMatchesFilterForm';
import { ContactInSegmentForm } from '../config-forms/triggers/ContactInSegmentForm';
import { AnniversaryForm } from '../config-forms/triggers/AnniversaryForm';
import { FormSubmittedForm } from '../config-forms/triggers/FormSubmittedForm';
import { EmailOpenedForm } from '../config-forms/triggers/EmailOpenedForm';
import { LinkClickedForm } from '../config-forms/triggers/LinkClickedForm';
import { UnsubscribedForm } from '../config-forms/triggers/UnsubscribedForm';
import { WebpageVisitedForm } from '../config-forms/triggers/WebpageVisitedForm';
import { CustomEventForm } from '../config-forms/triggers/CustomEventForm';
// Action forms
import { SendEmailForm } from '../config-forms/actions/SendEmailForm';
import { NotifyEmailForm } from '../config-forms/actions/NotifyEmailForm';
import { CallWebhookForm } from '../config-forms/actions/CallWebhookForm';
import { AddToListForm } from '../config-forms/actions/AddToListForm';
import { RemoveFromListForm } from '../config-forms/actions/RemoveFromListForm';
import { UpdateContactForm } from '../config-forms/actions/UpdateContactForm';
import { BlocklistContactForm } from '../config-forms/actions/BlocklistContactForm';
import { AssignUserForm } from '../config-forms/actions/AssignUserForm';
import { DeleteContactForm } from '../config-forms/actions/DeleteContactForm';
// Rule forms
import { DelayForm } from '../config-forms/rules/DelayForm';
import { ConditionalSplitForm } from '../config-forms/rules/ConditionalSplitForm';
import { PercentageSplitForm } from '../config-forms/rules/PercentageSplitForm';
import { WaitForEventForm } from '../config-forms/rules/WaitForEventForm';

export interface ConfigFormProps {
  defaultValues: Record<string, any>;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}

const CONFIG_FORMS: Record<string, React.ComponentType<ConfigFormProps>> = {
  contact_added_to_list:     ContactAddedToListForm,
  contact_removed_from_list: ContactRemovedFromListForm,
  contact_matches_filter:    ContactMatchesFilterForm,
  contact_in_segment:        ContactInSegmentForm,
  anniversary:               AnniversaryForm,
  form_submitted:            FormSubmittedForm,
  email_opened:              EmailOpenedForm,
  link_clicked:              LinkClickedForm,
  unsubscribed:              UnsubscribedForm,
  webpage_visited:           WebpageVisitedForm,
  custom_event:              CustomEventForm,
  send_email:                SendEmailForm,
  notify_email:              NotifyEmailForm,
  call_webhook:              CallWebhookForm,
  add_to_list:               AddToListForm,
  remove_from_list:          RemoveFromListForm,
  update_contact:            UpdateContactForm,
  blocklist_contact:         BlocklistContactForm,
  assign_user:               AssignUserForm,
  delete_contact:            DeleteContactForm,
  delay:                     DelayForm,
  conditional_split:         ConditionalSplitForm,
  percentage_split:          PercentageSplitForm,
  wait_for_event:            WaitForEventForm,
};

export function NodeConfigPanel() {
  const store = useWorkflowStore();
  const node = store.nodes.find(n => n.id === store.selectedNodeId);

  if (!node) return null;

  const subtype = String(node.data?.subtype ?? '');
  const FormComponent = CONFIG_FORMS[subtype];

  const onSave = (config: Record<string, any>) => {
    store.updateNodeConfig(node.id, config, true);
    store.setSelectedNode(null);
    store.setPanelMode('palette');
  };

  const onCancel = () => {
    store.setSelectedNode(null);
    store.setPanelMode('palette');
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">

      {/* Header — grey bg, bottom border */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border flex-shrink-0">
        <div>
          <div className="text-sm font-medium text-foreground">{String(node.data?.label ?? '')}</div>
          <div className="text-xs text-muted-foreground">Step #{String(node.data?.stepId ?? '')}</div>
        </div>
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground leading-none text-lg"
        >
          ×
        </button>
      </div>

      {/* Content — white, scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-5 bg-white">
        {FormComponent ? (
          <FormComponent
            defaultValues={(node.data?.config as Record<string, any>) ?? {}}
            onSave={onSave}
            onCancel={onCancel}
          />
        ) : (
          <div className="text-sm text-muted-foreground text-center py-6">
            No configuration needed for this node.
            <div className="mt-4">
              <Button size="sm" onClick={() => onSave({})}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
