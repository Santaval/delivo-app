import { toast } from "@/context/ToastContext";
import i18n from "@/i18n";
import ClientsService from "@/services/clients/Clients.service";
import { useCallback, useMemo, useRef, useState } from "react";
import useFocusRefetch from "./useFocusRefetch";

const useClients = () => {
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [query, setQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchClients = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) {
      if (hasLoadedRef.current) setIsRefreshing(true);
      else setIsInitialLoading(true);
    }

    try {
      const response = await ClientsService.getClients();
      setAllClients(response);
      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      // Mantiene los datos viejos visibles pero avisa que la recarga falló
      if (hasLoadedRef.current) toast.error(i18n.t('loadFailedError'));
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Recarga al volver a la pantalla (ej. después de crear un cliente)
  useFocusRefetch((isFirstFocus) => {
    fetchClients({ silent: !isFirstFocus });
  });

  const clients = useMemo(() => {
    if (!query) return allClients;

    return allClients.filter(client =>
      client.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [allClients, query]);

  return {
    clients,
    loading: isInitialLoading || isRefreshing,
    isInitialLoading,
    isRefreshing,
    error,
    searchClients: setQuery,
    refresh: fetchClients,
  };
};

export default useClients;
