import { act, renderHook } from '@testing-library/react-native';
import useFocusRefetch from '@/hooks/useFocusRefetch';

// Guarda el efecto de foco para poder simular que se vuelve a la pantalla
const focusEffect: { current: (() => void) | null } = { current: null };

jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void) => {
    const React = require('react');
    focusEffect.current = effect;
    React.useEffect(() => {
      effect();
    }, [effect]);
  },
}));

const simulateRefocus = () => act(() => {
  focusEffect.current?.();
});

describe('useFocusRefetch', () => {
  beforeEach(() => {
    focusEffect.current = null;
  });

  it('marca el primer enfoque como carga inicial y los siguientes como recarga', () => {
    const fetch = jest.fn();

    renderHook(() => useFocusRefetch(fetch));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenLastCalledWith(true);

    simulateRefocus();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith(false);
  });

  it('vuelve a tratar el enfoque como carga inicial cuando cambia resetKey', () => {
    const fetch = jest.fn();

    const { rerender } = renderHook(
      ({ id }: { id: string }) => useFocusRefetch(fetch, id),
      { initialProps: { id: 'client-1' } }
    );

    expect(fetch).toHaveBeenLastCalledWith(true);

    simulateRefocus();
    expect(fetch).toHaveBeenLastCalledWith(false);

    rerender({ id: 'client-2' });

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenLastCalledWith(true);
  });

  it('usa siempre la última versión de fetch sin volver a ejecutarse en cada render', () => {
    const first = jest.fn();
    const second = jest.fn();

    const { rerender } = renderHook(
      ({ fetch }: { fetch: (isFirstFocus: boolean) => void }) => useFocusRefetch(fetch),
      { initialProps: { fetch: first } }
    );

    expect(first).toHaveBeenCalledTimes(1);

    rerender({ fetch: second });
    expect(second).not.toHaveBeenCalled();

    simulateRefocus();
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
  });
});
