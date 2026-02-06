import BaseApiService from "../config/BaseApiService";

export default class ProductsService extends BaseApiService {

  static async all() : Promise<Product[]> {
    const { data } = await this.get<Product[]>('/products');
    return data;
  }

  static async create(product: any): Promise<Product> {
    const { data } = await this.post<Product>('/products', product);
    return data;
  }

}