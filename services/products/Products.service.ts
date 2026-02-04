import BaseApiService from "../config/BaseApiService";

export default class ProductsService extends BaseApiService {

  static async all() : Promise<Product[]> {
    const { data } = await this.get<Product[]>('/products');
    return data;
  }



}