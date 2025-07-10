import { useState, useEffect } from 'react';

interface CheckinData {
  CHAVE: number;
  DATA: string;
  HORA: string;
  CLIENTE: string;
  NOME: string;
  TELEFONE: string;
  CIDADE: string;
  LATITUDE: string;
  LONGITUDE: string;
  TECNICO: string;
  DATA_FORMATADA: string;
  HORA_FORMATADA: string;
}

interface CheckinFilters {
  cliente?: string;
  tecnico?: string;
  dataInicio?: string;
  dataFim?: string;
}

interface CheckinPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CheckinResponse {
  data: CheckinData[];
  pagination: CheckinPagination;
  filters: CheckinFilters;
}

export function useCheckin(filters: CheckinFilters = {}, page: number = 1, limit: number = 50) {
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);
  const [pagination, setPagination] = useState<CheckinPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckin = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());

      if (filters.cliente) {
        searchParams.append('cliente', filters.cliente);
      }
      if (filters.tecnico) {
        searchParams.append('tecnico', filters.tecnico);
      }
      if (filters.dataInicio) {
        searchParams.append('dataInicio', filters.dataInicio);
      }
      if (filters.dataFim) {
        searchParams.append('dataFim', filters.dataFim);
      }

      const response = await fetch(`/api/checkin?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de checkin');
      }

      const data: CheckinResponse = await response.json();
      
      setCheckinData(data.data);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar checkin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckin();
  }, [filters.cliente, filters.tecnico, filters.dataInicio, filters.dataFim, page, limit]);

  const refetch = () => {
    fetchCheckin();
  };

  return {
    checkinData,
    pagination,
    loading,
    error,
    refetch
  };
} 