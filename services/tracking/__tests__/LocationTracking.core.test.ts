import {
  buildPoint,
  classifyStatus,
  MAX_BUFFERED_POINTS,
  mergePoints,
  processLocations,
  type RawLocation,
  type TrackingDeps,
  type TrackingSession,
} from '../LocationTracking.core';

const raw = (n: number, coords: Partial<RawLocation['coords']> = {}): RawLocation => ({
  coords: { latitude: 9 + n / 1000, longitude: -84, heading: 45, speed: 3, accuracy: 10, ...coords },
  timestamp: Date.UTC(2026, 5, 1, 8, 0, n),
});

const session: TrackingSession = { routeId: 'route-1', companyId: 'company-1' };

const makeDeps = (overrides: Partial<TrackingDeps> = {}) => {
  let buffer: DriverLocationPoint[] = [];
  const deps: TrackingDeps = {
    readSession: jest.fn(async () => session),
    readBuffer: jest.fn(async () => buffer),
    writeBuffer: jest.fn(async (points) => {
      buffer = points;
    }),
    send: jest.fn(async () => 204),
    stop: jest.fn(async () => {}),
    ...overrides,
  };
  return { deps, getBuffer: () => buffer };
};

describe('buildPoint', () => {
  it('convierte -1 de iOS (heading/speed/accuracy) a null', () => {
    const point = buildPoint(raw(1, { heading: -1, speed: -1, accuracy: -1 }));
    expect(point.heading).toBeNull();
    expect(point.speed).toBeNull();
    expect(point.accuracy).toBeNull();
  });

  it('conserva valores válidos y serializa recordedAt en ISO', () => {
    const point = buildPoint(raw(1));
    expect(point).toMatchObject({ heading: 45, speed: 3, accuracy: 10 });
    expect(point.recordedAt).toBe('2026-06-01T08:00:01.000Z');
  });

  it('trata null, undefined, NaN y heading > 360 como desconocidos', () => {
    expect(buildPoint(raw(1, { heading: null, speed: undefined })).heading).toBeNull();
    expect(buildPoint(raw(1, { heading: NaN })).heading).toBeNull();
    expect(buildPoint(raw(1, { heading: 400 })).heading).toBeNull();
    expect(buildPoint(raw(1, { speed: undefined })).speed).toBeNull();
  });

  it('acepta heading 0 y speed 0', () => {
    const point = buildPoint(raw(1, { heading: 0, speed: 0 }));
    expect(point.heading).toBe(0);
    expect(point.speed).toBe(0);
  });
});

describe('mergePoints', () => {
  it('ordena por tiempo, elimina duplicados y descarta coordenadas inválidas', () => {
    const a = buildPoint(raw(1));
    const b = buildPoint(raw(2));
    const bad = buildPoint(raw(3, { latitude: 120 }));
    expect(mergePoints([b], [a, b, bad])).toEqual([a, b]);
  });

  it(`conserva solo los últimos ${MAX_BUFFERED_POINTS} puntos`, () => {
    const many = Array.from({ length: 30 }, (_, i) => buildPoint(raw(i)));
    const merged = mergePoints([], many);
    expect(merged).toHaveLength(MAX_BUFFERED_POINTS);
    expect(merged[merged.length - 1]).toEqual(many[29]);
    expect(merged[0]).toEqual(many[10]);
  });
});

describe('classifyStatus', () => {
  it.each([
    [204, 'sent'],
    [200, 'sent'],
    [403, 'stop'],
    [404, 'stop'],
    [409, 'stop'],
    [400, 'drop'],
    [401, 'retry'],
    [429, 'retry'],
    [500, 'retry'],
    [undefined, 'retry'],
    [0, 'retry'],
  ])('%s -> %s', (status, expected) => {
    expect(classifyStatus(status as number | undefined)).toBe(expected);
  });
});

describe('processLocations', () => {
  it('envía el lote y vacía el buffer en éxito', async () => {
    const { deps, getBuffer } = makeDeps();

    await expect(processLocations([raw(1), raw(2)], deps)).resolves.toBe('sent');

    expect(deps.send).toHaveBeenCalledWith(session, [buildPoint(raw(1)), buildPoint(raw(2))]);
    expect(getBuffer()).toEqual([]);
    expect(deps.stop).not.toHaveBeenCalled();
  });

  it.each([403, 409, 404])('detiene el seguimiento ante un %s', async (status) => {
    const { deps } = makeDeps({ send: jest.fn(async () => status) });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('stop');

    expect(deps.stop).toHaveBeenCalledTimes(1);
    expect(deps.writeBuffer).not.toHaveBeenCalled();
  });

  it('sin conexión guarda los puntos y los envía junto con los nuevos en el siguiente intento', async () => {
    const send = jest.fn<Promise<number | undefined>, [TrackingSession, DriverLocationPoint[]]>();
    send.mockResolvedValueOnce(undefined);
    send.mockResolvedValueOnce(204);
    const { deps, getBuffer } = makeDeps({ send });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('retry');
    expect(getBuffer()).toEqual([buildPoint(raw(1))]);

    await expect(processLocations([raw(2)], deps)).resolves.toBe('sent');
    expect(send).toHaveBeenLastCalledWith(session, [buildPoint(raw(1)), buildPoint(raw(2))]);
    expect(getBuffer()).toEqual([]);
  });

  it('con 429 o 5xx conserva el buffer y no detiene el seguimiento', async () => {
    const { deps, getBuffer } = makeDeps({ send: jest.fn(async () => 429) });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('retry');

    expect(getBuffer()).toHaveLength(1);
    expect(deps.stop).not.toHaveBeenCalled();
  });

  it('el buffer offline nunca supera el máximo', async () => {
    const { deps, getBuffer } = makeDeps({ send: jest.fn(async () => undefined) });

    for (let i = 0; i < 30; i++) await processLocations([raw(i)], deps);

    expect(getBuffer()).toHaveLength(MAX_BUFFERED_POINTS);
  });

  it('con 400 descarta el lote pero sigue rastreando', async () => {
    const { deps, getBuffer } = makeDeps({ send: jest.fn(async () => 400) });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('drop');

    expect(getBuffer()).toEqual([]);
    expect(deps.stop).not.toHaveBeenCalled();
  });

  it('sin sesión guardada detiene las actualizaciones y no envía nada', async () => {
    const { deps } = makeDeps({ readSession: jest.fn(async () => null) });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('no-session');

    expect(deps.stop).toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
  });

  it('en pausa no envía ni acumula', async () => {
    const { deps } = makeDeps({ readSession: jest.fn(async () => ({ ...session, paused: true })) });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('paused');

    expect(deps.send).not.toHaveBeenCalled();
    expect(deps.writeBuffer).not.toHaveBeenCalled();
  });

  it('nunca lanza aunque el almacenamiento falle', async () => {
    const { deps } = makeDeps({
      readBuffer: jest.fn(async () => {
        throw new Error('storage');
      }),
    });

    await expect(processLocations([raw(1)], deps)).resolves.toBe('retry');
  });
});
