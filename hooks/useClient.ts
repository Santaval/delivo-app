import i18n from "@/i18n";
import ClientsService from "@/services/clients/Clients.service";
import { useState } from "react";
import useFocusRefetch from "./useFocusRefetch";

const useClient = (clientId: string) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recarga al volver a la pantalla (ej. después de editar el cliente)
  useFocusRefetch((isFirstFocus) => {
    if (isFirstFocus) setIsInitialLoading(true);
    fetchClient({ silent: !isFirstFocus });
  }, clientId);

  const fetchClient = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      setError(null);
      const clientData = await ClientsService.getClientById(clientId);
      setClient(clientData);

      if (!clientData) {
        setError(i18n.t('clientNotFound'));
      }
    } catch (err) {
      setError(i18n.t('loadFailedError'));
      console.error('Error fetching client:', err);
    } finally {
      if (!silent) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const refreshClient = async () => {
    if (client) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    await fetchClient();
  };

  const updateClient = async (data: Partial<Client>) => {
    if (!client) return;

    try {
      setIsMutating(true);
      const updatedClient = await ClientsService.updateClient(clientId, { ...client, ...data });
      setClient(updatedClient);
      return updatedClient;
    } catch (err) {
      console.error('Failed to update client:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteClient = async () => {
    try {
      setIsMutating(true);
      await ClientsService.deleteClient(clientId);
      setClient(null);
    } catch (err) {
      console.error('Failed to delete client:', err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const updateLocation = async (location: LocationCords) => {
    if (!client) return;

    try {
      setIsMutating(true);
      const updatedClientData = {
        ...client,
        lat: location.lat,
        lng: location.lng,
      };
      const updatedClient = await ClientsService.updateClient(clientId, updatedClientData);
      setClient(updatedClient);
    } catch (error) {
      console.error('Failed to update client location:', error);
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  const loading = isInitialLoading || isRefreshing || isMutating;

  return {
    client,
    loading,
    isInitialLoading,
    isRefreshing,
    isMutating,
    error,
    refreshClient,
    updateClient,
    deleteClient,
    updateLocation
  };
}

export default useClient
