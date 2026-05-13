export const TABLES = {
  USERS: 'tbl_users',
  PROVIDERS: 'tbl_providers',
  METADATA: 'tbl_meta_info',
  CAMPAIGNS: 'tbl_campaigns',
  TEMPLATES: 'tbl_templates',
  SENDER_EMAILS: 'tbl_sender_emails',
  USER_TEMPLATES: 'tbl_user_templates',
  SEGMENTS: 'tbl_segments',
  SUBSCRIBERS: 'tbl_subscribers',
  SUBSCRIBER_SEGMENT: 'tbl_subscriber_segment',
  CAMPAIGN_AUDIENCES: 'tbl_campaign_audiences',
  CAMPAIGN_SENDS: 'tbl_campaign_sends',
  DOMAINS: 'tbl_domains',
  NOTES: 'tbl_notes',
  BRAND_STYLES: 'tbl_brand_styles',
  BRAND_LOGOS: 'tbl_brand_logos',
  // Automation tables
  CAMPAIGN_SCHEDULES: 'tbl_campaign_schedules',
  WORKFLOWS: 'tbl_workflows',
  WORKFLOW_EXECUTIONS: 'tbl_workflow_executions',
  EXECUTION_LOGS: 'tbl_execution_logs',
  EMAIL_TEMPLATES: 'tbl_email_templates',
  SENT_EMAILS: 'tbl_sent_emails',
  EMAIL_EVENTS: 'tbl_email_events',
  CUSTOM_EVENTS: 'tbl_custom_events',
  EVENT_WAITERS: 'tbl_event_waiters',
  FORMS: 'tbl_forms',
  FORM_SUBMISSIONS: 'tbl_form_submissions',
  FORM_VIEWS: 'tbl_form_views',
  FORM_VISITORS: 'tbl_form_visitors',
  FORM_RESPONSES: 'tbl_form_responses',
  PAGES: 'tbl_pages',
  PAGE_TEMPLATES: 'tbl_page_templates',
  PAGE_VISITORS: 'tbl_page_visitors',
  CONTACT_BLOCKLIST: 'tbl_contact_blocklist',
  CONTACT_ATTRIBUTES: 'tbl_contact_attributes',
  PAGE_VIEWS: 'tbl_page_views',
  PAGE_SESSIONS: 'tbl_page_sessions',
  WEBHOOK_LOGS: 'tbl_webhook_logs',
  ROUND_ROBIN_STATE: 'tbl_round_robin_state',
};

export const PROVIDER_TYPES = {
  EMAIL: 1,
  USERNAME: 2,
  PHONE_NUMBER: 3,
};

export const USER_ROLES = {
  VENDOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const USER_STATUS = {
  DELETED: 0,
  VERIFIED: 1,
  PENDING: 2,
  SUSPENDED: 3,
};
