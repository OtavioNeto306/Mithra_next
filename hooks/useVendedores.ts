import { useEffect, useState } from "react";

export interface Vendedor {
  CODI_PES: string;
  NOME_PES: string;
}

export function useVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendedores() {
      try {
        setLoading(true);
        const response = await fetch('/api/vendedores');
        const data = await response.json();
        
        if (data.success) {
          setVendedores(data.data);
          setError(null);
        } else {
          setError(data.error || 'Erro ao carregar vendedores');
          setVendedores([]);
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
        setVendedores([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVendedores();
  }, []);

  return { vendedores, loading, error };
} 