import {
  initialsOf,
  interpolatePosition,
  shortestAngleDelta,
  staleMinutes,
  STALE_AFTER_MS,
} from '../driverLocation';

describe('staleMinutes', () => {
  const now = Date.UTC(2026, 5, 1, 12, 0, 0);

  it('es null mientras la ubicación tiene 2 minutos o menos', () => {
    expect(staleMinutes(new Date(now - 30_000).toISOString(), now)).toBeNull();
    expect(staleMinutes(new Date(now - STALE_AFTER_MS).toISOString(), now)).toBeNull();
  });

  it('devuelve los minutos transcurridos cuando es más antigua', () => {
    expect(staleMinutes(new Date(now - 3 * 60_000 - 5_000).toISOString(), now)).toBe(3);
    expect(staleMinutes(new Date(now - 12 * 60_000).toISOString(), now)).toBe(12);
  });

  it('ignora fechas inválidas', () => {
    expect(staleMinutes('nope', now)).toBeNull();
  });
});

describe('interpolatePosition', () => {
  const a = { lat: 0, lng: 0, heading: 350 };
  const b = { lat: 10, lng: 20, heading: 10 };

  it('interpola coordenadas linealmente', () => {
    expect(interpolatePosition(a, b, 0.5)).toMatchObject({ lat: 5, lng: 10 });
    expect(interpolatePosition(a, b, 0)).toMatchObject({ lat: 0, lng: 0 });
    expect(interpolatePosition(a, b, 2)).toMatchObject({ lat: 10, lng: 20 });
  });

  it('gira por el camino más corto (350 -> 10 pasa por 0)', () => {
    expect(interpolatePosition(a, b, 0.5).heading).toBeCloseTo(0);
    expect(interpolatePosition(a, b, 1).heading).toBeCloseTo(10);
  });

  it('conserva el rumbo conocido si el otro es null', () => {
    expect(interpolatePosition({ ...a, heading: null }, b, 0.5).heading).toBe(10);
    expect(interpolatePosition(a, { ...b, heading: null }, 0.5).heading).toBe(350);
    expect(interpolatePosition({ ...a, heading: null }, { ...b, heading: null }, 0.5).heading).toBeNull();
  });
});

describe('shortestAngleDelta', () => {
  it.each([
    [350, 10, 20],
    [10, 350, -20],
    [0, 180, 180],
    [90, 90, 0],
  ])('%s -> %s = %s', (from, to, expected) => {
    expect(shortestAngleDelta(from, to)).toBe(expected);
  });
});

describe('initialsOf', () => {
  it('toma hasta dos iniciales', () => {
    expect(initialsOf('juan pérez gómez')).toBe('JP');
    expect(initialsOf('Ana')).toBe('A');
    expect(initialsOf('')).toBe('?');
    expect(initialsOf(null)).toBe('?');
  });
});
