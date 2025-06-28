import { PayloadResponse, SubscriptionV2, WebsiteV2 } from '../aaas-admin-api.types';

export type UpgradeWebsiteSubscriptionV2Input = {
  intpWebsiteId: string;
  packageId: string;
  trial?: boolean;
  proRate?: boolean;
};

export type UpgradeWebsiteSubscriptionV2Response = PayloadResponse<SubscriptionV2>;

export type DowngradeWebsiteSubscriptionV2Input = {
  intpWebsiteId: string;
  packageId: string;
};

export type DowngradeWebsiteSubscriptionV2Response = PayloadResponse<SubscriptionV2>;

export type CancelWebsiteSubscriptionV2Input = {
  intpWebsiteId: string;
  freePackageId?: string;
};

export type CancelWebsiteSubscriptionV2Response = PayloadResponse<SubscriptionV2>;

export type ResumeWebsiteSubscriptionV2Input = {
  intpWebsiteId: string;
};

export type ResumeWebsiteSubscriptionV2Response = PayloadResponse<SubscriptionV2>;

export type DeactivateWebsiteSubscriptionV2Input = {
  intpWebsiteId: string;
};

export type DeactivateWebsiteSubscriptionV2Response = PayloadResponse<WebsiteV2>;
