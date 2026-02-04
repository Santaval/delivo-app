import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default class BaseApiService {

  private api;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${process.env.API_ACCESS_TOKEN}`,
        "x-company-id": process.env.COMPANY_ID || 'default-company-id',
      },
    });
  }


  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  public post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  public put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

}
