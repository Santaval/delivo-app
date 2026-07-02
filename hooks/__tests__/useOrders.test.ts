import { renderHook, waitFor, act } from '@testing-library/react-native';
import useOrders from '@/hooks/useOrders';
import OrdersService from '@/services/orders/Orders.service';

jest.mock('@/services/orders/Orders.service');
jest.mock('@/context/ToastContext', () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const mockedOrdersService = OrdersService as jest.Mocked<typeof OrdersService>;

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

describe('useOrders (PBI-003: Registro y Gestión de Órdenes de Pedido)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CP-ORD-06
  it('carga las órdenes al montar el hook y expone loading=false al terminar', async () => {
    const orders = [buildOrder({ id: 'order-1', number: 101 }), buildOrder({ id: 'order-2', number: 102 })];
    mockedOrdersService.all.mockResolvedValueOnce(orders);

    const { result } = renderHook(() => useOrders());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orders).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  // CP-ORD-07
  it('reporta un error legible cuando falla la carga de órdenes', async () => {
    mockedOrdersService.all.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.orders).toEqual([]);
  });

  // CP-ORD-08
  it('filtra las órdenes por nombre de cliente o número de orden (búsqueda)', async () => {
    const orders = [
      buildOrder({ id: 'order-1', number: 101, client: { id: 'c1', name: 'Soda La Esquina' } as Client }),
      buildOrder({ id: 'order-2', number: 202, client: { id: 'c2', name: 'Panadería El Trigo' } as Client }),
    ];
    mockedOrdersService.all.mockResolvedValueOnce(orders);

    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.search('esquina');
    });
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].id).toBe('order-1');

    act(() => {
      result.current.search('202');
    });
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].id).toBe('order-2');

    act(() => {
      result.current.search('');
    });
    expect(result.current.orders).toHaveLength(2);
  });
});
