import { act, renderHook, waitFor } from '@testing-library/react-native';
import useOrder from '@/hooks/useOrder';
import OrdersService from '@/services/orders/Orders.service';
import RoutesService from '@/services/routes/Routes.service';

jest.mock('@/services/orders/Orders.service');
jest.mock('@/services/routes/Routes.service');

jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      effect();
    }, [effect]);
  },
}));

const mockedOrdersService = OrdersService as jest.Mocked<typeof OrdersService>;
const mockedRoutesService = RoutesService as jest.Mocked<typeof RoutesService>;

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'order-1',
  client: { id: 'client-1', name: 'Soda La Esquina' } as Client,
  number: 101,
  pricing: { subtotal: 1000, ivaTotal: 130, total: 1130 },
  items: [],
  status: 'PENDING',
  paid: 0,
  deliveryStatus: 'PENDING',
  route: null,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  ...overrides,
});

describe('useOrder.addToRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('agrega la orden a la ruta y recarga la orden con su ruta', async () => {
    const onRoute = buildOrder({
      deliveryStatus: 'ON_ROUTE',
      route: { id: 'route-1', name: 'Ruta Norte', status: 'CREATED' },
    });
    mockedOrdersService.getOrderById
      .mockResolvedValueOnce(buildOrder())
      .mockResolvedValueOnce(onRoute);
    mockedRoutesService.addPoint.mockResolvedValueOnce({} as Route);

    const { result } = renderHook(() => useOrder('order-1'));
    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    await act(async () => {
      await result.current.addToRoute('route-1');
    });

    expect(mockedRoutesService.addPoint).toHaveBeenCalledWith('route-1', 'order-1');
    expect(result.current.order?.route).toEqual({ id: 'route-1', name: 'Ruta Norte', status: 'CREATED' });
    expect(result.current.order?.deliveryStatus).toBe('ON_ROUTE');
    expect(result.current.isMutating).toBe(false);
  });

  it('propaga el error (p. ej. 409) y libera isMutating', async () => {
    mockedOrdersService.getOrderById.mockResolvedValue(buildOrder());
    const conflict = Object.assign(new Error('Conflict'), { response: { status: 409 } });
    mockedRoutesService.addPoint.mockRejectedValueOnce(conflict);

    const { result } = renderHook(() => useOrder('order-1'));
    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    await act(async () => {
      await expect(result.current.addToRoute('route-1')).rejects.toBe(conflict);
    });

    expect(result.current.isMutating).toBe(false);
    // The order wasn't reloaded after the failure
    expect(mockedOrdersService.getOrderById).toHaveBeenCalledTimes(1);
  });
});
