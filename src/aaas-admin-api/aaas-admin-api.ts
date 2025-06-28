import { AaasAdminHttpClient } from 'src/aaas-admin-http-client';
import {
  CreateIntpcV2Input,
  CreateIntpcV2Response,
  CreateWebsiteV2Input,
  CreateWebsiteV2Response,
  CreateWebsiteV3Input,
  CreateWebsiteV3Response,
  GetIntpcV2Input,
  GetIntpcV2Response,
  GetWebsiteV2Input,
  GetWebsiteV2Response,
} from './aaas-admin-api.types';
import {
  CancelIntpcSubscriptionV3Input,
  CancelIntpcSubscriptionV3Response,
  CancelWebsiteSubscriptionV2Input,
  CancelWebsiteSubscriptionV2Response,
  DowngradeIntpcSubscriptionV3Input,
  DowngradeIntpcSubscriptionV3Response,
  DowngradeWebsiteSubscriptionV2Input,
  DowngradeWebsiteSubscriptionV2Response,
  ResumeIntpcSubscriptionV3Input,
  ResumeIntpcSubscriptionV3Response,
  ResumeWebsiteSubscriptionV2Input,
  ResumeWebsiteSubscriptionV2Response,
  UpgradeIntpcSubscriptionV3Input,
  UpgradeIntpcSubscriptionV3Response,
  UpgradeWebsiteSubscriptionV2Input,
  UpgradeWebsiteSubscriptionV2Response,
} from './types';

export class AaasAdminApi {
  constructor(private readonly httpClient: AaasAdminHttpClient) {}

  async createIntpcV2(input: CreateIntpcV2Input) {
    return this.httpClient.post<CreateIntpcV2Response>('/v2/3as/customers', input);
  }

  async getIntpcV2(input: GetIntpcV2Input) {
    return this.httpClient.get<GetIntpcV2Response>(`/v2/3as/customers/${input.intpcId}`);
  }

  async getWebsiteV2(input: GetWebsiteV2Input) {
    return this.httpClient.get<GetWebsiteV2Response>(`/v2/3as/websites/${input.intpWebsiteId}`);
  }

  async createWebsiteV2(input: CreateWebsiteV2Input) {
    return this.httpClient.post<CreateWebsiteV2Response>('/v2/3as/websites', input);
  }

  async createWebsiteV3(input: CreateWebsiteV3Input) {
    return this.httpClient.post<CreateWebsiteV3Response>('/v3/3as/websites', input);
  }

  async upgradeWebsiteSubscriptionV2(input: UpgradeWebsiteSubscriptionV2Input) {
    return this.httpClient.post<UpgradeWebsiteSubscriptionV2Response>(
      '/v2/3as/notifications/subscriptions/upgrade',
      input,
    );
  }

  async downgradeWebsiteSubscriptionV2(input: DowngradeWebsiteSubscriptionV2Input) {
    return this.httpClient.post<DowngradeWebsiteSubscriptionV2Response>(
      '/v2/3as/notifications/subscriptions/downgrade',
      input,
    );
  }

  async cancelWebsiteSubscriptionV2(input: CancelWebsiteSubscriptionV2Input) {
    return this.httpClient.post<CancelWebsiteSubscriptionV2Response>(
      '/v2/3as/notifications/subscriptions/cancel',
      input,
    );
  }

  async resumeWebsiteSubscriptionV2(input: ResumeWebsiteSubscriptionV2Input) {
    return this.httpClient.post<ResumeWebsiteSubscriptionV2Response>(
      '/v2/3as/notifications/subscriptions/resume',
      input,
    );
  }

  async deactivateWebsiteSubscriptionV2(input: ResumeWebsiteSubscriptionV2Input) {
    return this.httpClient.post<ResumeWebsiteSubscriptionV2Response>(
      '/v2/3as/notifications/subscriptions/deactivate',
      input,
    );
  }

  async upgradeIntpcSubscriptionV3(input: UpgradeIntpcSubscriptionV3Input) {
    return this.httpClient.post<UpgradeIntpcSubscriptionV3Response>('/v3/3as/intpc-subscriptions/upgrade', input);
  }

  async downgradeIntpcSubscriptionV3(input: DowngradeIntpcSubscriptionV3Input) {
    return this.httpClient.post<DowngradeIntpcSubscriptionV3Response>('/v3/3as/intpc-subscriptions/downgrade', input);
  }

  async cancelIntpcSubscriptionV3(input: CancelIntpcSubscriptionV3Input) {
    return this.httpClient.post<CancelIntpcSubscriptionV3Response>('/v3/3as/intpc-subscriptions/cancel', input);
  }

  async resumeIntpcSubscriptionV3(input: ResumeIntpcSubscriptionV3Input) {
    return this.httpClient.post<ResumeIntpcSubscriptionV3Response>('/v3/3as/intpc-subscriptions/resume', input);
  }

  async deactivateIntpcSubscriptionV3(input: ResumeIntpcSubscriptionV3Input) {
    return this.httpClient.post<ResumeIntpcSubscriptionV3Response>('/v3/3as/intpc-subscriptions/deactivate', input);
  }
}
