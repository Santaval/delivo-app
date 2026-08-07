import { AxiosRequestConfig, AxiosResponse } from "axios";
import api from "../api";
export default class BaseApiService {
  static get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.get<T>(url, config);
  }

  static post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.post<T>(url, data, config);
  }

  static put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.put<T>(url, data, config);
  }

  static delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.delete<T>(url, config);
  }

  static patch<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.patch<T>(url, data, config);
  }
}
