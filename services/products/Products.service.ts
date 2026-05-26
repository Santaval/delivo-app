import BaseApiService from "../config/BaseApiService";

export default class ProductsService extends BaseApiService {
  static async all(): Promise<Product[]> {
    const { data } = await this.get<Product[]>("/products");
    return data;
  }

  static async create(product: Partial<Product>): Promise<Product> {
    const { data } = await this.post<Product>("/products", product);
    return data;
  }

  static async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data } = await this.put<Product>(`/products/${id}`, product);
    return data;
  }

  static async remove(id: string): Promise<void> {
    await this.delete(`/products/${id}`);
  }

  static async findById(id: string): Promise<Product> {
    const { data } = await this.get<Product>(`/products/${id}`);
    return data;
  }
}
