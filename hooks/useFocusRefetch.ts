import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

/** Sentinela: garantiza que el primer enfoque siempre cuente como carga inicial. */
const NEVER_FOCUSED = Symbol('never-focused');

/**
 * Ejecuta `fetch` cada vez que la pantalla gana el foco.
 *
 * `isFirstFocus` es true en el primer enfoque y cada vez que cambia `resetKey`
 * (por ejemplo el id de un detalle), para que el consumidor muestre el loader
 * inicial esa vez y recargue en silencio al volver de una pantalla hija.
 */
const useFocusRefetch = (fetch: (isFirstFocus: boolean) => void, resetKey?: unknown) => {
  // El fetch vive en un ref para no re-suscribir el efecto en cada render
  const fetchRef = useRef(fetch);
  fetchRef.current = fetch;

  const focusedKeyRef = useRef<unknown>(NEVER_FOCUSED);

  useFocusEffect(
    useCallback(() => {
      const isFirstFocus = focusedKeyRef.current !== resetKey;
      focusedKeyRef.current = resetKey;
      fetchRef.current(isFirstFocus);
    }, [resetKey])
  );
};

export default useFocusRefetch;
