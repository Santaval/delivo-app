import OrdersService from '@/services/orders/Orders.service';
import api from '@/services/api';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  client: { id: 'client-1', name: 'Soda La Esquina' } as Client,
  number: 101,
  pricing: { subtotal: 1000, ivaTotal: 130, total: 1130 },
  items: [],
  status: 'PENDING',
  paid: 0,
  deliveryStatus: 'PENDING',
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  ...overrides,
});

describe('OrdersService (PBI-003: Registro y Gestión de Órdenes de Pedido)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CP-ORD-01
  it('crea una orden nueva asociada a un cliente y retorna el estado PENDING inicial', async () => {
    const created = buildOrder();
    mockedApi.post.mockResolvedValueOnce({ data: created } as any);

    const result = await OrdersService.create({ clientId: 'client-1' });

    expect(mockedApi.post).toHaveBeenCalledWith('/orders', { clientId: 'client-1' }, undefined);
    expect(result.status).toBe('PENDING');
    expect(result.id).toBe('order-1');
  });

  // CP-ORD-02
  it('agrega un ítem (producto + cantidad) a una orden existente', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} } as any);

    await OrdersService.addItemToOrder('order-1', { productId: 'prod-9', quantity: 3 });

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/orders/order-1/items',
      { productId: 'prod-9', quantity: 3 },
      undefined,
    );
  });

  // CP-ORD-03
  it('retorna null cuando la orden solicitada no existe en el backend', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: null } as any);

    const result = await OrdersService.getOrderById('order-inexistente');

    expect(result).toBeNull();
  });

  // CP-ORD-04
  it('propaga el error cuando la API falla al listar las órdenes (comportamiento offline/errores de red)', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(OrdersService.all()).rejects.toThrow('Network Error');
  });

  // CP-ORD-05
  it('registra el pago de una orden con el monto y método indicados', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} } as any);

    await OrdersService.addPayment('order-1', 1130, 'sinpe-movil');

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/orders/order-1/payments',
      { amount: 1130, methodId: 'sinpe-movil' },
      undefined,
    );
  });

  // CP-ORD-09
  it('lista todas las órdenes de la compañía activa', async () => {
    const orders = [buildOrder({ id: 'order-1' }), buildOrder({ id: 'order-2' })];
    mockedApi.get.mockResolvedValueOnce({ data: orders } as any);

    const result = await OrdersService.all();

    expect(mockedApi.get).toHaveBeenCalledWith('/orders', undefined);
    expect(result).toHaveLength(2);
  });

  // CP-ORD-10
  it('retorna la orden encontrada por id', async () => {
    const order = buildOrder({ id: 'order-42' });
    mockedApi.get.mockResolvedValueOnce({ data: order } as any);

    const result = await OrdersService.getOrderById('order-42');

    expect(mockedApi.get).toHaveBeenCalledWith('/orders/order-42', undefined);
    expect(result?.id).toBe('order-42');
  });

  // CP-ORD-11
  it('elimina un ítem de la orden', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: {} } as any);

    await OrdersService.removeItemFromOrder('order-1', 'item-1');

    expect(mockedApi.delete).toHaveBeenCalledWith('/orders/order-1/items/item-1', undefined);
  });

  // CP-ORD-12
  it('marca una orden como entregada (deliveryStatus DELIVERED)', async () => {
    mockedApi.patch.mockResolvedValueOnce({ data: {} } as any);

    await OrdersService.markAsDelivered('order-1');

    expect(mockedApi.patch).toHaveBeenCalledWith('/orders/order-1/delivered', {}, undefined);
  });

  // CP-ORD-13
  it('lista las órdenes de un cliente, con y sin filtro de facturación', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] } as any);
    await OrdersService.byCustomerId('client-1');
    expect(mockedApi.get).toHaveBeenCalledWith('/orders/client/client-1', undefined);

    mockedApi.get.mockResolvedValueOnce({ data: [] } as any);
    await OrdersService.byCustomerIdBilled('client-1');
    expect(mockedApi.get).toHaveBeenCalledWith('/orders/client/client-1/billed', undefined);
  });
});
