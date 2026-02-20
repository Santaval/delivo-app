import ClientsService from "@/services/clients/Clients.service";
import { useEffect, useState } from "react";

const useClient = (clientId: string) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setError(null);
      const clientData = await ClientsService.getClientById(clientId);
      setClient(clientData);

      if (!clientData) {
        setError('Client not found');
      }
    } catch (err) {
      setError('Failed to load client information');
      console.error('Error fetching client:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (location: LocationCords) => {
    if (!client) return;

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  return {
    client,
    loading,
    error,
    refreshClient: fetchClient,
    updateLocation
  };
}

export default useClient