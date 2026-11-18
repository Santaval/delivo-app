import axios from 'axios';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';

const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => mockStore[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      mockStore[k] = v;
    }),
    removeItem: jest.fn(async (k: string) => {
      delete mockStore[k];
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((k) => delete mockStore[k]);
    }),
  },
}));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn() }));
jest.mock('expo-location', () => ({
  hasStartedLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
}));
jest.mock('axios', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('@/config/env', () => ({ __esModule: true, default: { apiUrl: 'https://api.test/api/v1' } }));

type TaskBody = { data: { locations: any[] }; error: null };

describe('LocationTracking.task', () => {
  let executor: (body: TaskBody) => Promise<void>;
  const location = {
    coords: { latitude: 9.9, longitude: -84, heading: -1, speed: -1, accuracy: 8 },
    timestamp: Date.UTC(2026, 5, 1, 8, 0, 0),
  };

  beforeAll(() => {
    require('../LocationTracking.task');
    executor = (TaskManager.defineTask as jest.Mock).mock.calls[0][1];
  });

  beforeEach(() => {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
    mockStore['driverTracking.session'] = JSON.stringify({ routeId: 'route-1', companyId: 'company-1' });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('jwt');
    (Location.hasStartedLocationUpdatesAsync as jest.Mock).mockResolvedValue(true);
    (axios.post as jest.Mock).mockReset();
    (Location.stopLocationUpdatesAsync as jest.Mock).mockClear();
  });

  it('registra la tarea a nivel de módulo con el nombre esperado', () => {
    expect((TaskManager.defineTask as jest.Mock).mock.calls[0][0]).toBe('delivo-driver-location-tracking');
  });

  it('envía con sus propios headers (token de SecureStore) y null para heading/speed de iOS', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 204 });

    await executor({ data: { locations: [location] }, error: null });

    const [url, body, config] = (axios.post as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.test/api/v1/routes/route-1/location');
    expect(body.locations[0]).toMatchObject({ heading: null, speed: null, accuracy: 8 });
    expect(config.headers).toMatchObject({ Authorization: 'Bearer jwt', 'x-company-id': 'company-1' });
    expect(Location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  it.each([409, 403])('ante %s detiene las actualizaciones y borra la sesión', async (status) => {
    (axios.post as jest.Mock).mockResolvedValue({ status });

    await executor({ data: { locations: [location] }, error: null });

    expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith('delivo-driver-location-tracking');
    expect(mockStore['driverTracking.session']).toBeUndefined();
  });

  it('sin conexión conserva el punto en el buffer persistente', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    await executor({ data: { locations: [location] }, error: null });

    expect(JSON.parse(mockStore['driverTracking.buffer'])).toHaveLength(1);
    expect(Location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  it('sin token (sesión cerrada) detiene el seguimiento', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await executor({ data: { locations: [location] }, error: null });

    expect(axios.post).not.toHaveBeenCalled();
    expect(Location.stopLocationUpdatesAsync).toHaveBeenCalled();
  });
});
