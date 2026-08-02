import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { RouteProvider, useRoute } from '@/context/RouteContext';
import RoutesService from '@/services/routes/Routes.service';
import useUserLocation from '@/hooks/useUserLocation';
import { toast } from '@/context/ToastContext';

jest.mock('@/services/routes/Routes.service');
jest.mock('@/hooks/useUserLocation', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/context/ToastContext', () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const mockedUseUserLocation = useUserLocation as jest.Mock;
const mockedToast = toast as jest.Mocked<typeof toast>;

const withKnownLocation = () =>
  mockedUseUserLocation.mockReturnValue({
    location: { coords: { latitude: 9.9333, longitude: -84.0833 } },
    errorMsg: null,
    permissionDenied: false,
    refreshLocation: jest.fn(),
    openSettings: jest.fn(),
  });

const mockedRoutesService = RoutesService as jest.Mocked<typeof RoutesService>;

const buildPoint = (overrides: Partial<RoutePoint> = {}): RoutePoint => ({
  id: 'p1',
  status: 'CREATED',
  index: 0,
  order: {} as Order,
  routeId: 'route-1',
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const buildRoute = (points: RoutePoint[], overrides: Partial<Route> = {}): Route => ({
  id: 'route-1',
  name: 'Ruta Centro',
  status: 'CREATED',
  companyId: 'company-1',
  polyline: '',
  points,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <RouteProvider>{children}</RouteProvider>
);

describe('RouteContext (PBI-004: Inteligencia Logística y Optimización de Rutas)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    withKnownLocation();
  });

  // CP-RUT-09
  it('ordena las paradas de la ruta por índice ascendente al obtenerla, aunque el backend las envíe desordenadas', async () => {
    const unordered = [
      buildPoint({ id: 'p-third', index: 2 }),
      buildPoint({ id: 'p-first', index: 0 }),
      buildPoint({ id: 'p-second', index: 1 }),
    ];
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute(unordered));

    const { result } = renderHook(() => useRoute(), { wrapper });

    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    expect(result.current.route?.points.map((p) => p.id)).toEqual(['p-first', 'p-second', 'p-third']);
    expect(result.current.getCurrentPoint()?.id).toBe('p-first');
  });

  // CP-RUT-10
  it('avanza a la siguiente parada al completar la entrega actual', async () => {
    const points = [
      buildPoint({ id: 'p-first', index: 0, status: 'CREATED' }),
      buildPoint({ id: 'p-second', index: 1, status: 'CREATED' }),
    ];
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute(points));
    mockedRoutesService.completeDelivery.mockResolvedValueOnce(points[0]);

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    expect(result.current.getCurrentPoint()?.id).toBe('p-first');

    await act(async () => {
      await result.current.completeCurrentDelivery();
    });

    expect(mockedRoutesService.completeDelivery).toHaveBeenCalledWith('p-first');
    expect(result.current.getCurrentPoint()?.id).toBe('p-second');
    expect(result.current.route?.status).toBe('CREATED');
  });

  // CP-RUT-11
  it('marca la ruta completa (status COMPLETED) al entregar la última parada pendiente', async () => {
    const points = [buildPoint({ id: 'p-only', index: 0, status: 'CREATED' })];
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute(points));
    mockedRoutesService.completeDelivery.mockResolvedValueOnce(points[0]);

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    await act(async () => {
      await result.current.completeCurrentDelivery();
    });

    expect(result.current.route?.status).toBe('COMPLETED');
    expect(result.current.getCurrentPoint()).toBeNull();
  });

  // CP-RUT-12
  it('reporta un error legible cuando falla la carga de la ruta', async () => {
    mockedRoutesService.find.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useRoute(), { wrapper });

    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.route).toBeNull();
  });

  // CP-RUT-13
  it('getNextPoint() devuelve la parada siguiente a la actual, o null si ya es la última', async () => {
    const points = [
      buildPoint({ id: 'p-first', index: 0, status: 'CREATED' }),
      buildPoint({ id: 'p-second', index: 1, status: 'CREATED' }),
    ];
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute(points));

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    expect(result.current.getNextPoint()?.id).toBe('p-second');

    mockedRoutesService.completeDelivery.mockResolvedValueOnce(points[1]);
    await act(async () => {
      await result.current.completeCurrentDelivery();
    });
    expect(result.current.getNextPoint()).toBeNull();
  });

  // CP-RUT-14
  it('inicia la navegación enviando la ubicación GPS actual y refresca la ruta', async () => {
    const points = [buildPoint({ id: 'p-first', index: 0 })];
    mockedRoutesService.find.mockResolvedValue(buildRoute(points, { status: 'STARTED' }));
    mockedRoutesService.startNavigation.mockResolvedValueOnce(buildRoute(points, { status: 'STARTED' }));

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    await act(async () => {
      await result.current.startNavigation();
    });

    expect(mockedRoutesService.startNavigation).toHaveBeenCalledWith('route-1', {
      lat: 9.9333,
      lng: -84.0833,
    });
    expect(result.current.route?.status).toBe('STARTED');
  });

  // CP-RUT-15
  it('propaga el error al completar una entrega cuando el backend falla, para que la pantalla pueda notificar al usuario', async () => {
    const points = [buildPoint({ id: 'p-first', index: 0 })];
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute(points));
    mockedRoutesService.completeDelivery.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    await expect(
      act(async () => {
        await result.current.completeCurrentDelivery();
      }),
    ).rejects.toThrow('Server error');
  });

  // CP-RUT-16
  it('clearRoute, updateRoute y clearError administran el estado local sin llamar al backend', async () => {
    const { result } = renderHook(() => useRoute(), { wrapper });

    act(() => {
      result.current.updateRoute(buildRoute([], { id: 'route-local' }));
    });
    expect(result.current.route?.id).toBe('route-local');

    act(() => {
      result.current.clearRoute();
    });
    expect(result.current.route).toBeNull();

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
    expect(mockedRoutesService.find).not.toHaveBeenCalled();
  });

  // CP-RUT-17
  it('no inicia la navegación y notifica al usuario cuando no hay ubicación GPS disponible', async () => {
    mockedUseUserLocation.mockReturnValue({
      location: null,
      errorMsg: 'no location',
      permissionDenied: true,
      refreshLocation: jest.fn(),
      openSettings: jest.fn(),
    });
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute([buildPoint()]));

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    await act(async () => {
      await result.current.startNavigation();
    });

    expect(mockedToast.error).toHaveBeenCalled();
    expect(mockedRoutesService.startNavigation).not.toHaveBeenCalled();
  });

  // CP-RUT-18
  it('notifica un error genérico cuando el backend falla al iniciar la navegación', async () => {
    mockedRoutesService.find.mockResolvedValueOnce(buildRoute([buildPoint()]));
    mockedRoutesService.startNavigation.mockRejectedValueOnce(new Error('Server unavailable'));

    const { result } = renderHook(() => useRoute(), { wrapper });
    await act(async () => {
      await result.current.fetchRoute('route-1');
    });

    await act(async () => {
      await result.current.startNavigation();
    });

    expect(mockedToast.error).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  // CP-RUT-19
  it('useRoute() lanza un error explícito cuando se usa fuera de RouteProvider', () => {
    expect(() => renderHook(() => useRoute())).toThrow(
      'useRoute must be used within a RouteProvider',
    );
  });

  // CP-RUT-20
  it('sin un routeId inicial, el proveedor no dispara ninguna carga automática', () => {
    const { result } = renderHook(() => useRoute(), { wrapper });

    expect(result.current.route).toBeNull();
    expect(mockedRoutesService.find).not.toHaveBeenCalled();
  });
});
