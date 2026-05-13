export function getNodeDefaults(subtype: string): { defaultLabel: string; defaultConfig: Record<string, any> } {
  const defaults: Record<string, { label: string; config: Record<string, any> }> = {
    contact_added_to_list:     { label: 'Contact added to a list',        config: { listId: null, filters: null } },
    contact_removed_from_list: { label: 'Contact removed from a list',    config: { listId: null, filters: null } },
    contact_matches_filter:    { label: 'Contact matches custom filters',  config: { filters: null, entryTime: '09:00', timezone: 'UTC' } },
    contact_in_segment:        { label: 'Contact is in a segment',        config: { segmentId: null, entryTime: '09:00', timezone: 'UTC' } },
    anniversary:               { label: 'Anniversary',                    config: { dateAttribute: 'birthday', timing: 'same_day', offset: 0, entryTime: '09:00', timezone: 'UTC', filters: null } },
    form_submitted:            { label: 'Form submitted',                 config: { formId: null, filters: null } },
    email_opened:              { label: 'Email opened',                   config: { campaignId: null } },
    link_clicked:              { label: 'Link clicked in an email',       config: { campaignId: null, urlFilter: null } },
    unsubscribed:              { label: 'Unsubscribed from emails',       config: {} },
    webpage_visited:           { label: 'Webpage visited',               config: { websiteFilters: { conditions: [] }, filters: null } },
    custom_event:              { label: 'Custom event',                   config: { eventName: '', filters: null } },
    send_email:        { label: 'Send an email',               config: { messageId: null, subject: '', previewText: '', senderName: '', senderEmail: '', replyTo: null } },
    notify_email:      { label: 'Notify by email',             config: { sender: { email: '', name: '' }, recipientType: 'specific', recipients: [], recipientAttribute: null, subject: '', body: '' } },
    call_webhook:      { label: 'Call a webhook',              config: { url: '', includeContactDetails: false, includeTriggerEvent: false } },
    add_to_list:       { label: 'Add contact to a list',       config: { listId: null } },
    remove_from_list:  { label: 'Remove contact from a list',  config: { listId: null } },
    update_contact:    { label: 'Update contact attribute',    config: { attributes: [{ field: '', value: '' }] } },
    blocklist_contact: { label: 'Blocklist contact',           config: { blockType: 'marketing' } },
    assign_user:       { label: 'Assign a user to a contact',  config: { assignmentType: 'specific', userId: null } },
    delete_contact:    { label: 'Delete a contact',            config: { confirmed: false } },
    delay:              { label: 'Time delay',                   config: { months: 0, days: 1, hours: 0, minutes: 0 } },
    conditional_split:  { label: 'Conditional split',            config: { branches: [
      { id: 'branch_a', name: 'Branch A', isFallback: false, conditions: null },
      { id: 'branch_b', name: 'Branch B (fallback)', isFallback: true, conditions: null },
    ] } },
    percentage_split:   { label: 'Percentage split',             config: { branches: [
      { id: 'branch_a', name: 'Branch A', percentage: 50 },
      { id: 'branch_b', name: 'Branch B', percentage: 50 },
    ] } },
    wait_for_event:     { label: 'Wait until an event happens',  config: { eventType: 'email_opened', eventConfig: {}, waitTime: { months: 0, days: 3, hours: 0, minutes: 0 } } },
    exit: { label: 'Exit', config: {} },
  };

  const entry = defaults[subtype];
  if (!entry) return { defaultLabel: subtype, defaultConfig: {} };
  return { defaultLabel: entry.label, defaultConfig: entry.config };
}
