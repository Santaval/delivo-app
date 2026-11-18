import useDriverLiveLocation, {
  backoffDelay,
  MAX_STREAM_FAILURES,
  POLL_INTERVAL_MS,
} from '@/hooks/useDriverLiveLocation';
import RoutesService from '@/services/routes/Routes.service';
import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

type Handler = (event: any) => void;

jest.mock('react-native-sse', () => {
  class FakeEventSource {
    static instances: FakeEventSource[] = [];
    handlers: Record<string, Handler[]> = {};
    closed = false;
    url: string;
    options: any;
    constructor(url: string, options: any) {
      this.url = url;
      this.options = options;
      FakeEventSource.instances.push(this);
    }
    addEventListener(type: string, handler: Handler) {
      (this.handlers[type] ||= []).push(handler);
    }
    removeAllEventListeners() {
      this.handlers = {};
    }
    close() {
      this.closed = true;
    }
    emit(type: string, event: any = {}) {
      (this.handlers[type] ?? []).forEach((h) => h({ type, ...event }));
    }
  }
  return { __esModule: true, default: FakeEventSource };
});

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    defaults: {
      baseURL: 'https://api.test/api/v1',
      headers: { common: { Authorization: 'Bearer tok', 'x-company-id': 'company-1' } },
    },
  },
}));
jest.mock('@/services/routes/Routes.service', () => ({
  __esModule: true,
  default: { getDriverLocation: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const FakeEventSource = require('react-native-sse').default as {
  instances: {
    url: string;
    options: any;
    closed: boolean;
    emit: (type: string, event?: any) => void;
  }[];
};
const mockedService = RoutesService as jest.Mocked<typeof RoutesService>;

const loc = (lat: number, recordedAt = '2026-06-01T08:00:00.000Z'): RouteDriverLocation => ({
  lat,
  lng: -84,
  heading: 10,
  recordedAt,
});
const latest = () => FakeEventSource.instances[FakeEventSource.instances.length - 1];

let appStateHandler: ((state: string) => void) | undefined;

describe('useDriverLiveLocation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    FakeEventSource.instances.length = 0;
    mockedService.getDriverLocation.mockReset();
    appStateHandler = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, handler: any) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    }) as any);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('backoff exponencial con tope de 30 s', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(backoffDelay)).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000]);
  });

  it('no abre nada si no está habilitado', () => {
    const { result } = renderHook(() =>
      useDriverLiveLocation('route-1', { enabled: false, initial: loc(1) }),
    );
    expect(FakeEventSource.instances).toHaveLength(0);
    expect(result.current.location).toBeNull();
  });

  it('arranca con la ubicación inicial y abre el stream con los headers de auth', () => {
    const { result } = renderHook(() =>
      useDriverLiveLocation('route-1', { enabled: true, initial: loc(1) }),
    );

    expect(result.current.location).toEqual(loc(1));
    expect(latest().url).toBe('https://api.test/api/v1/routes/route-1/location/stream');
    expect(latest().options.headers).toEqual({ Authorization: 'Bearer tok', 'x-company-id': 'company-1' });
  });

  it('actualiza con eventos location, limpia con cleared y cierra sin reconectar con finished', () => {
    const { result } = renderHook(() => useDriverLiveLocation('route-1', { enabled: true }));
    const es = latest();

    act(() => es.emit('location', { data: JSON.stringify(loc(5)) }));
    expect(result.current.location).toEqual(loc(5));

    act(() => es.emit('cleared', { data: 'null' }));
    expect(result.current.location).toBeNull();

    act(() => es.emit('location', { data: JSON.stringify(loc(6)) }));
    act(() => es.emit('finished', { data: '{}' }));
    expect(result.current.location).toBeNull();
    expect(es.closed).toBe(true);

    act(() => {
      jest.advanceTimersByTime(120_000);
    });
    expect(FakeEventSource.instances).toHaveLength(1);
    expect(mockedService.getDriverLocation).not.toHaveBeenCalled();
  });

  it('ignora datos malformados', () => {
    const { result } = renderHook(() =>
      useDriverLiveLocation('route-1', { enabled: true, initial: loc(1) }),
    );
    act(() => latest().emit('location', { data: '{oops' }));
    expect(result.current.location).toEqual(loc(1));
  });

  it('reconecta con backoff tras un error', () => {
    renderHook(() => useDriverLiveLocation('route-1', { enabled: true }));
    const first = latest();

    act(() => first.emit('error', { xhrStatus: 0 }));
    expect(first.closed).toBe(true);
    expect(FakeEventSource.instances).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(FakeEventSource.instances).toHaveLength(1);
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(FakeEventSource.instances).toHaveLength(2);

    act(() => latest().emit('error', { xhrStatus: 502 }));
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(FakeEventSource.instances).toHaveLength(3);
  });

  it(`tras ${MAX_STREAM_FAILURES} fallos seguidos pasa a polling cada ${POLL_INTERVAL_MS / 1000} s`, async () => {
    mockedService.getDriverLocation.mockResolvedValue(loc(7));
    const { result } = renderHook(() => useDriverLiveLocation('route-1', { enabled: true }));

    for (let i = 0; i < MAX_STREAM_FAILURES; i++) {
      act(() => latest().emit('error', { xhrStatus: 500 }));
      await act(async () => {
        jest.advanceTimersByTime(backoffDelay(i + 1));
      });
    }

    expect(FakeEventSource.instances).toHaveLength(MAX_STREAM_FAILURES);
    expect(result.current.mode).toBe('polling');
    expect(mockedService.getDriverLocation).toHaveBeenCalledTimes(1);
    expect(result.current.location).toEqual(loc(7));

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });
    expect(mockedService.getDriverLocation).toHaveBeenCalledTimes(2);
  });

  it('no reintenta si el servidor responde 403 (sin permiso)', () => {
    const { result } = renderHook(() => useDriverLiveLocation('route-1', { enabled: true }));

    act(() => latest().emit('error', { xhrStatus: 403 }));
    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(result.current.mode).toBe('idle');
  });

  it('cierra el stream al pasar a segundo plano y lo reabre al volver', () => {
    renderHook(() => useDriverLiveLocation('route-1', { enabled: true }));
    const first = latest();

    act(() => appStateHandler?.('background'));
    expect(first.closed).toBe(true);
    expect(FakeEventSource.instances).toHaveLength(1);

    act(() => appStateHandler?.('active'));
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(latest().closed).toBe(false);
  });

  it('cierra el stream al desmontar', () => {
    const { unmount } = renderHook(() => useDriverLiveLocation('route-1', { enabled: true }));
    const es = latest();
    unmount();
    expect(es.closed).toBe(true);
  });
});
