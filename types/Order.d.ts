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
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

interface OrderItem extends Product {
  quantity: number;
  productId: string;
}