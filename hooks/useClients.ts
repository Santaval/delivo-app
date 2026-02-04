import ClientsService from "@/services/clients/Clients.service";
import { useEffect, useState } from "react";

const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [originalClients, setOriginalClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await ClientsService.getClients();
      setClients(response);
      setOriginalClients(response);
    } catch (err) {
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const searchClients = (query: string) => {
    if (!query) {
      setClients(originalClients);
      return;
    }

    const filtered = originalClients.filter(client =>
      client.name.toLowerCase().includes(query.toLowerCase())
    );
    setClients(filtered);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, error, searchClients };
};

export default useClients;