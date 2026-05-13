export const CAMPAIGN_STATUS = {
    PENDING: 0,
    IN_QUEUE: 1,
    RUNNING: 2,
    COMPLETED: 3,
}

export const CAMPAIGN_TYPE = {
    DRAFT: 0,
    LIVE: 1,
    SCHEDULED: 2,
}

export const CAMPAIGN_SEND_STATUS = {
    PENDING: 0,
    SENT: 1,
    SKIPPED: 2,
    FAILED: 3,
} as const;

export const AUDIENCE_TYPE = {
    SEGMENT: 0,
    SUBSCRIBER: 1,
} as const;

export type AudienceType = typeof AUDIENCE_TYPE[keyof typeof AUDIENCE_TYPE];
