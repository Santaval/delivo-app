import RoutesService from '@/services/routes/Routes.service';
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

const buildRoute = (overrides: Partial<Route> = {}): Route => ({
  id: 'route-1',
  name: 'Ruta Centro',
  status: 'CREATED',
  companyId: 'company-1',
  polyline: '',
  points: [],
  createdAt: '2026-06-01T08:00:00.000Z',
  updatedAt: '2026-06-01T08:00:00.000Z',
  ...overrides,
});

describe('RoutesService (PBI-004: Inteligencia Logística y Optimización de Rutas)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CP-RUT-01
  it('crea una ruta nueva en estado CREATED a partir de un nombre', async () => {
    const created = buildRoute();
    mockedApi.post.mockResolvedValueOnce({ data: created } as any);

    const result = await RoutesService.create({ name: 'Ruta Centro' });

    expect(mockedApi.post).toHaveBeenCalledWith('/routes', { name: 'Ruta Centro' }, undefined);
    expect(result.status).toBe('CREATED');
  });

  // CP-RUT-02
  it('agrega una orden como parada (punto) de una ruta existente', async () => {
    const updated = buildRoute({
      points: [{ id: 'p1', status: 'CREATED', index: 0, order: {} as Order, routeId: 'route-1', createdAt: '', updatedAt: '' }],
    });
    mockedApi.post.mockResolvedValueOnce({ data: updated } as any);

    const result = await RoutesService.addPoint('route-1', 'order-9');

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/routes/route-1/points',
      { orderId: 'order-9' },
      undefined,
    );
    expect(result.points).toHaveLength(1);
  });

  // CP-RUT-03
  it('inicia la navegación de una ruta enviando la ubicación GPS actual del repartidor', async () => {
    const startedRoute = buildRoute({ status: 'STARTED' });
    mockedApi.post.mockResolvedValueOnce({ data: startedRoute } as any);
    const startLocation: LocationCords = { lat: 9.9333, lng: -84.0833 };

    const result = await RoutesService.startNavigation('route-1', startLocation);

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/routes/route-1/start',
      { startLocation },
      undefined,
    );
    expect(result.status).toBe('STARTED');
  });

  // CP-RUT-04
  it('marca una parada como completada (entrega finalizada)', async () => {
    const completedPoint: RoutePoint = {
      id: 'p1',
      status: 'VISITED',
      index: 0,
      order: {} as Order,
      routeId: 'route-1',
      createdAt: '',
      updatedAt: '',
    };
    mockedApi.patch.mockResolvedValueOnce({ data: completedPoint } as any);

    const result = await RoutesService.completeDelivery('p1');

    expect(mockedApi.patch).toHaveBeenCalledWith('/routes/points/p1/complete', {}, undefined);
    expect(result.status).toBe('VISITED');
  });

  // CP-RUT-05
  it('propaga el error cuando el backend rechaza la creación de la ruta', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('Validation failed'));

    await expect(RoutesService.create({ name: '' })).rejects.toThrow('Validation failed');
  });

  // CP-RUT-13
  it('lista todas las rutas de la compañía activa', async () => {
    const routes = [buildRoute({ id: 'route-1' }), buildRoute({ id: 'route-2' })];
    mockedApi.get.mockResolvedValueOnce({ data: routes } as any);

    const result = await RoutesService.all();

    expect(mockedApi.get).toHaveBeenCalledWith('/routes', undefined);
    expect(result.data).toHaveLength(2);
  });

  // CP-RUT-14
  it('obtiene el detalle de una ruta específica por id', async () => {
    const route = buildRoute({ id: 'route-7' });
    mockedApi.get.mockResolvedValueOnce({ data: route } as any);

    const result = await RoutesService.find('route-7');

    expect(mockedApi.get).toHaveBeenCalledWith('/routes/route-7', undefined);
    expect(result.id).toBe('route-7');
  });
});
