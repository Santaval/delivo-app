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

export default interface OrderItem extends Product {
  quantity: number;
  productId: string;
}