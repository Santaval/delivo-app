import { renderHook, waitFor } from '@testing-library/react-native';
import useRoutes from '@/hooks/useRoutes';
import RoutesService from '@/services/routes/Routes.service';

jest.mock('@/services/routes/Routes.service');
jest.mock('@/context/ToastContext', () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const mockedRoutesService = RoutesService as jest.Mocked<typeof RoutesService>;

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

describe('useRoutes (PBI-004: Inteligencia Logística y Optimización de Rutas)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CP-RUT-06
  it('carga las rutas al montar el hook', async () => {
    const routes = [buildRoute({ id: 'route-1' }), buildRoute({ id: 'route-2', status: 'STARTED' })];
    mockedRoutesService.all.mockResolvedValueOnce({ data: routes } as any);

    const { result } = renderHook(() => useRoutes());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.routes).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  // CP-RUT-07
  it('filtra las rutas por estado (CREATED, STARTED, COMPLETED)', async () => {
    const routes = [
      buildRoute({ id: 'route-1', status: 'CREATED' }),
      buildRoute({ id: 'route-2', status: 'STARTED' }),
      buildRoute({ id: 'route-3', status: 'COMPLETED' }),
    ];
    mockedRoutesService.all.mockResolvedValueOnce({ data: routes } as any);

    const { result } = renderHook(() => useRoutes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.filterByStatus('STARTED')).toHaveLength(1);
    expect(result.current.filterByStatus('STARTED')[0].id).toBe('route-2');
    expect(result.current.filterByStatus('COMPLETED')[0].id).toBe('route-3');
  });

  // CP-RUT-08
  it('reporta un error legible cuando falla la carga de rutas', async () => {
    mockedRoutesService.all.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useRoutes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.routes).toEqual([]);
  });
});
