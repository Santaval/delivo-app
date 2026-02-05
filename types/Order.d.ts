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
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

interface OrderItem extends Product {
  quantity: number;
  productId: string;
}