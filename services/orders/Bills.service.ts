import BaseApiService from "../config/BaseApiService";

export type BillsPageParams = {
  page: number;
  pageSize: number;
  status: BillsStatusFilter;
  search?: string;
};

export default class BillsService extends BaseApiService {

  static async page({ page, pageSize, status, search }: BillsPageParams): Promise<BillsPage> {
    const { data } = await this.get<BillsPage>('/orders/bills', {
      params: { page, pageSize, status, search: search || undefined },
    });
    return data;
  }

}
