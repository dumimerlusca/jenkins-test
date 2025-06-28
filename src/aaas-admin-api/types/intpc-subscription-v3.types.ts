import { PayloadResponse, SubscriptionV2, WebsiteV2 } from '../aaas-admin-api.types';

export type UpgradeIntpcSubscriptionV3Input = {
  intpcId: string;
  packageId: string;
  trial?: boolean;
  proRate?: boolean;
};

export type UpgradeIntpcSubscriptionV3Response = PayloadResponse<SubscriptionV2>;

export type DowngradeIntpcSubscriptionV3Input = {
  intpcId: string;
  packageId: string;
};

export type DowngradeIntpcSubscriptionV3Response = PayloadResponse<SubscriptionV2>;

export type CancelIntpcSubscriptionV3Input = {
  intpcId: string;
};

export type CancelIntpcSubscriptionV3Response = PayloadResponse<SubscriptionV2>;

export type ResumeIntpcSubscriptionV3Input = {
  intpcId: string;
};

export type ResumeIntpcSubscriptionV3Response = PayloadResponse<SubscriptionV2>;

export type DeactivateIntpcSubscriptionV3Input = {
  intpcId: string;
};

export type DeactivateIntpcSubscriptionV3Response = PayloadResponse<WebsiteV2>;
