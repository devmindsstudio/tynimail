export interface InterfaceAuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface PayloadLoginRequest {
  email: string;
  password: string;
}

export interface PayloadRegister {
  email: string;
  password: string;
  name?: string;
}
export const CAMPAIGN_TYPE = {
  DRAFT: 0,
  LIVE: 1,
  SCHEDULED: 2,
} as const;

export type CampaignStatus = "draft" | "live" | "scheduled";

export const CAMPAIGN_STATUS_MAP: Record<CampaignStatus, number> = {
  draft: CAMPAIGN_TYPE.DRAFT,
  live: CAMPAIGN_TYPE.LIVE,
  scheduled: CAMPAIGN_TYPE.SCHEDULED,
};

export const CAMPAIGN_TYPE_TO_STATUS: Record<number, CampaignStatus> = {
  [CAMPAIGN_TYPE.DRAFT]: "draft",
  [CAMPAIGN_TYPE.LIVE]: "live",
  [CAMPAIGN_TYPE.SCHEDULED]: "scheduled",
};
