import BaseApiService from "../config/BaseApiService";

export default class ClientsService extends BaseApiService {

  static async getClients() : Promise<Client[]> {
    const { data } = await this.get<Client[]>('/clients');
    return data;
  }

  static async getClientById(id: string): Promise<Client> {
    const { data } = await this.get<Client>(`/clients/${id}`);
    return data;
  }

  static async createClient(data: any): Promise<Client> {
    const { data: client } = await this.post<Client>('/clients', data);
    return client;
  }

  static async updateClient(id: string, data: any): Promise<Client> {
    const { data: client } = await this.put<Client>(`/clients/${id}`, data);
    return client;
  }

  static async deleteClient(id: string) {
    return this.delete<void>(`/clients/${id}`);
  }

}