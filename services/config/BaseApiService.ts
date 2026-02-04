import config from "@/config/env";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
console.log('API URL:', config.apiUrl);
export default class BaseApiService {

  static api = axios.create({
    baseURL: config.apiUrl || 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${config.apiKey}`,
      "x-company-id": config.companyId || 'default-company-id',
    },
  });


  static get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  static post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  static put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  static delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

}
