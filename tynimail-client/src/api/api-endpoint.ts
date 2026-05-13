export const ALL_API_ENDPOINT = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    EMAIL_VERIFY: "/auth/verify-email",
    RESEND_EMAIL_VERIFICATION: "/auth/resend-email-verification",
    FORGET_PASSWORD: "/auth/forget-password",
    VERIFY_PASSWORD_OTP: "/auth/verify-password-otp",
    REFRESH_TOKEN: "/auth/refresh-token",
    RESET_PASSWORD: "/auth/reset-password",
  },
  CAMPAIGNS: {
    GET_ALL_CAMPAIGNS: "/campaigns",
  },
  EMAILS: {
    SENDER_EMAILS: "/sender-emails",
    VERIFY: "/sender-emails/verify",
    VERIFICATION: "/sender-emails/check-verification",
  },
  TEMPLATES: {
    ALL: "/templates",
  },
  USER_TEMPLATES: {
    ALL: "/user-templates",
  },
  SETGMENTS: {
    ALL: "/segments",
  },
  SUBSCRIBERS: {
    ALL: "/subscribers",
    LIST: "/subscribers/list",
    SINGLE_ADD: "/subscribers/add",
    ATTRIBUTES: "/subscribers/attributes",
  },
  WORKFLOWS: {
    ALL: "/workflows",
    SINGLE: (id: string) => `/workflows/${id}`,
    STATUS: (id: string) => `/workflows/${id}/status`,
    EXECUTIONS: (id: string) => `/workflows/${id}/executions`,
    EXECUTION: (executionId: string) => `/workflows/executions/${executionId}`,
    STATS: (id: string) => `/workflows/${id}/stats`,
  },
  TEAM: "/users/team",
  USERS: {
    PROFILE: "/users/profile",
    GENERATE_SITE_ID: "/users/generate-site-id",
    TRACKING: "/users/tracking",
    ELEMENT_TRACKING: "/users/element-tracking",
  },
  ELEMENT_RULES: {
    ALL: "/element-rules",
    BY_EVENT: (eventName: string) => `/element-rules?event=${encodeURIComponent(eventName)}`,
    SINGLE: (id: string) => `/element-rules/${id}`,
    TOGGLE: (id: string) => `/element-rules/${id}/toggle`,
  },
  PAGES: {
    ALL: "/pages",
    COPY: "/pages/copy",
    DELETE: "/pages/delete",
    PUBLIC: "/public/pages",
    PUBLIC_by_id: "/public/pages/by-id",
  },
  PAGES_TEMPLATE: {
    ALL: "/page-templates",
  },
  FORMS: {
    ALL: "/forms",
    PUBLIC: "/public/forms",
    PUBLIC_by_id: "/public/forms/by-id",
    COPY: "/forms/copy",
    DELETE: "/forms/delete",
    SUBMIT_BY_ID_RESPONSE: "/public/forms/by-id",
  },
  DOMAIN: {
    VERIFICATION: "/domains/verify",
    ALL: "/domains",
  },
};
