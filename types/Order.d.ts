interface Order {
    id: string;
  client: Client
  number: number;
  pricing: {
    subtotal: number;
    ivaTotal: number;
    total: number;
  };
  items: OrderItem[];
  status: OrderStatus;
  paid: number;
  deliveryStatus: OrderDeliveryStatus;
  /** The route the order is on, if any (summary only, not the full route). */
  route?: OrderRoute | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderRoute {
  id: string;
  name: string;
  status: Route["status"];
}

type OrderDeliveryStatus = "PENDING" | "ON_ROUTE" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";
type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

interface OrderItem extends Product {
  quantity: number;
  productId: string;
}
type BillsStatusFilter = OrderStatus | "ALL";

type BillsCounts = Record<BillsStatusFilter, number>;

interface BillsPage {
  data: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
  counts: BillsCounts;
}
