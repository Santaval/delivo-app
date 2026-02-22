import BaseApiService from "../config/BaseApiService";

export default class PaymentMethodsService extends BaseApiService {

  static async all() : Promise<PaymentMethod[]> {
    const { data } = await this.get<PaymentMethod[]>('/payment-methods');
    return data;
  }

  static async create(body: any): Promise<PaymentMethod> {
    const { data } = await this.post<PaymentMethod>('/payment-methods', body);
    return data;
  }

}