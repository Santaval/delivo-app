/** Only orders not yet on a route, dispatched, delivered or cancelled can join a route. */
export function canAddOrderToRoute(order: Pick<Order, 'route' | 'deliveryStatus' | 'status'>) {
  return !order.route && order.deliveryStatus === 'PENDING' && order.status !== 'CANCELLED';
}
