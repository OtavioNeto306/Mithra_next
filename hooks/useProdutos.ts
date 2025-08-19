import { useEffect, useState } from "react";

export interface Produto {
  CODIGO: string;
  NOME: string;
  DESCRICAO?: string;
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        const response = await fetch('/api/produtos/search?q=');
        const data = await response.json();
        
        if (data.success) {
          setProdutos(data.data);
          setError(null);
        } else {
          setError(data.error || 'Erro ao carregar produtos');
          setProdutos([]);
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, []);

  return { produtos, loading, error };
}