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
  route?: Route;
  createdAt: string;
  updatedAt: string;
}

type OrderDeliveryStatus = "PENDING" | "ON_ROUTE" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";
type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

interface OrderItem extends Product {
  quantity: number;
  productId: string;
}