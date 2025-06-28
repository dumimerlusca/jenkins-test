import { Config } from '@config';
import { VisitorAnalytics } from '@visitor-analytics/3as-sdk-v2';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type AccessToken = ReturnType<VisitorAnalytics['auth']['generateINTPAccessToken']>;

export class AaasAdminHttpClient {
  private accessToken: AccessToken;

  instance: AxiosInstance;
  constructor(params: { accessToken: AccessToken }) {
    this.instance = axios.create({
      baseURL: Config.apiGatewayUrl,
      timeout: 30 * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.accessToken = params.accessToken;

    this.instance.interceptors.request.use((config) => {
      if (this.accessToken.isExpired) {
        this.accessToken = this.accessToken.refresh();
      }
      config.headers.Authorization = `Bearer ${this.accessToken.value}`;

      // logger.info({
      //   type: 'Outgoing Request',
      //   url: config.url,
      //   method: config.method,
      //   headers: config.headers,
      //   data: config.data,
      // });
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Only enhance once
          if (!error.__formatted) {
            const details = {
              response: {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method,
                data: error.response.data,
              },
              request: {
                method: error.config.method,
                url: error.config.url,
                headers: error.config.headers,
                data: error.config.data,
              },
            };

            error.message += ':\n' + JSON.stringify(details, null, 2);

            Object.defineProperty(error, '__formatted', {
              value: true,
              enumerable: false,
              configurable: false,
              writable: false,
            });
          }

          return Promise.reject(error);
        }

        return Promise.reject(error);
      },
    );
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }
}
