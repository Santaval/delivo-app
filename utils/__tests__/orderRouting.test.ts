import { canAddOrderToRoute } from '@/utils/orderRouting';

const order = (overrides: Partial<Pick<Order, 'route' | 'deliveryStatus' | 'status'>> = {}) => ({
  route: null,
  deliveryStatus: 'PENDING' as OrderDeliveryStatus,
  status: 'PENDING' as OrderStatus,
  ...overrides,
});

describe('canAddOrderToRoute', () => {
  it('permite agregar una orden pendiente sin ruta', () => {
    expect(canAddOrderToRoute(order())).toBe(true);
    expect(canAddOrderToRoute(order({ status: 'PAID' }))).toBe(true);
    expect(canAddOrderToRoute(order({ route: undefined }))).toBe(true);
  });

  it('no permite agregar una orden que ya está en una ruta', () => {
    expect(canAddOrderToRoute(order({ route: { id: 'r1', name: 'Norte', status: 'CREATED' } }))).toBe(false);
  });

  it.each<OrderDeliveryStatus>(['ON_ROUTE', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'])(
    'no permite agregar una orden con deliveryStatus %s',
    (deliveryStatus) => {
      expect(canAddOrderToRoute(order({ deliveryStatus }))).toBe(false);
    },
  );

  it('no permite agregar una orden cancelada', () => {
    expect(canAddOrderToRoute(order({ status: 'CANCELLED' }))).toBe(false);
  });
});
