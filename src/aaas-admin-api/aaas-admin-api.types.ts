export type PayloadResponse<T> = {
  payload: T;
};

export type CreateIntpcV2Input = {
  intpCustomerId: string;
  email: string;

  // For INTPc subscription
  packageId?: string;
  billingDate?: string;

  website: {
    intpWebsiteId: string;
    domain: string;

    // For Website subscription
    packageId?: string;
    billingDate?: string;
  };
};

export type Intpc = {
  id: string;
  intpCustomerId: string;
  visaId: string;
  email: string;
  intpId: string;
  createdAt: string;
};

export type GetIntpcV2Input = {
  intpcId: string;
};

export type GetIntpcV2Response = PayloadResponse<Intpc>;

export type CreateIntpcV2Response = PayloadResponse<Intpc>;

export type GetWebsiteV2Input = {
  intpWebsiteId: string;
};

export type CreateWebsiteV2Input = {
  intpWebsiteId: string;
  intpCustomerId: string;
  domain: string;
  packageId?: string;
  billingDate?: string;
};

export type CreateWebsiteV3Input = {
  website: {
    id: string;
    domain: string;
    package?: {
      id: string;
      billingDate?: string;
    };
  };
  intpc: {
    id: string;
  };
  opts?: {
    uft?: boolean;
  };
};

export type CreateWebsiteV3Response = PayloadResponse<WebsiteV2>;

export enum CompanyBillingMode {
  company_managed = 'company_managed',
  platform_managed = 'platform_managed',
}

export type WebsiteV2 = {
  id: string;
  status: string;
  intpId: string;
  visaCustomerId: string;
  intpWebsiteId: string;
  intpCustomerId: string;
  domain: string;

  packageId: string;
  packageName: string;
  billingInterval: string;
  billingMode: CompanyBillingMode;
  lastPackageChangeAt?: string;
  plannedDowngradePackageId?: string;
  plannedDowngradePackageName?: string;
  plannedDowngradeBillingInterval?: string;

  inTrial: boolean;
  hadTrial: boolean;

  createdAt: string;
  expiresAt: string;
  stpResetAt?: string;

  visaTrackingCode?: string;
  visaMaxPrivacyModeTrackingCode?: string;
  consumption?: StpConsumption;
  subscriptionType?: string;
};

export type CreateWebsiteV2Response = PayloadResponse<WebsiteV2>;

export type StpConsumption = {
  stpLimit: number;
  stpConsumed: number;
  stpRateVisit: number;
  stpConsumedVisit: number;
  stpRateVisitEvent: number;
  stpConsumedVisitEvent: number;
  stpRateSessionRecording: number;
  stpConsumedSessionRecording: number;
  stpRateHeatmapIncrement: number;
  stpConsumedHeatmapIncrement: number;
  stpRatePollAnswer: number;
  stpConsumedPollAnswer: number;
  stpRateSurveyAnswer: number;
  stpConsumedSurveyAnswer: number;
  stpRateFunnelMatch: number;
  stpConsumedFunnelMatch: number;
};

export enum SubscriptionType {
  intpc = 'intpc',
  website = 'website',
}

export type GetWebsiteV2Response = PayloadResponse<{
  id: string;
  status: string;
  intpId: string;
  intpWebsiteId: string;
  intpCustomerId: string;
  visaTrackingCode: string;
  domain: string;
  packageId: string;
  packageName: string;
  billingInterval: string;
  lastPackageChangeAt?: string;
  plannedDowngradePackageId?: string;
  plannedDowngradePackageName?: string;
  plannedDowngradePackageInterval?: string;
  inTrial: boolean;
  hadTrial: boolean;
  createdAt: string;
  expiresAt: string;
  stpResetAt?: string;
  consumption?: StpConsumption;
  subscriptionType: SubscriptionType;
}>;

export type SubscriptionV2 = {
  id: string;
  status: string;
  packageId: string;
  websiteId?: string;
  intpId: string;
  intpcId: string;
  expiresAt: string;
  stpResetAt: string;
  lastPackageChangeAt: string;
  createdAt: string;
  billingInterval: string;
  type: string;
  inTrial: string;
  hadTrial: string;
  consumption: StpConsumption;
  plannedDowngradePackageId: string;
};
