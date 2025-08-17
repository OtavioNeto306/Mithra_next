import { useState, useEffect, useCallback } from 'react';

interface CheckinMapaData {
  CHAVE: number;
  DATA_ISO: string;
  HORA: string;
  CLIENTE: string;
  NOME: string;
  CIDADE: string;
  LAT: number;
  LNG: number;
  TECNICO: string;
  ordem_sequencial: number;
}

interface TrajetoriaData {
  checkins: CheckinMapaData[];
  trajetoriasPorTecnico: Record<string, CheckinMapaData[]>;
  estatisticas: {
    totalCheckins: number;
    totalTecnicos: number;
    periodoInicio: string | null;
    periodoFim: string | null;
  };
  centro: {
    lat: number;
    lng: number;
  };
}

interface FiltrosMapa {
  tecnico?: string;
  dataInicio?: string;
  dataFim?: string;
  cliente?: string;
}

interface UseMapaTrajetoriaReturn {
  data: TrajetoriaData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateFiltros: (filtros: FiltrosMapa) => void;
  filtros: FiltrosMapa;
  ultimoCheckin: CheckinMapaData | null;
  atualizacaoAutomatica: boolean;
  toggleAtualizacaoAutomatica: () => void;
}

export function useMapaTrajetoria(filtrosIniciais: FiltrosMapa = {}): UseMapaTrajetoriaReturn {
  const [data, setData] = useState<TrajetoriaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosMapa>(filtrosIniciais);
  const [ultimoCheckin, setUltimoCheckin] = useState<CheckinMapaData | null>(null);
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(false);

  // Sincronizar filtros internos com filtros recebidos como props
  useEffect(() => {
    setFiltros(filtrosIniciais);
  }, [filtrosIniciais.tecnico, filtrosIniciais.dataInicio, filtrosIniciais.dataFim, filtrosIniciais.cliente]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filtros.tecnico) params.append('tecnico', filtros.tecnico);
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.cliente) params.append('cliente', filtros.cliente);

      const response = await fetch(`/api/checkin/mapa?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido');
      }
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do mapa';
      setError(errorMessage);
      console.error('Erro ao buscar dados do mapa:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const fetchUltimoCheckin = useCallback(async (tecnico: string) => {
    try {
      const response = await fetch('/api/checkin/mapa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tecnico }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setUltimoCheckin(result.data);
        
        // Se há um novo check-in, atualizar os dados completos
        if (data && result.data.CHAVE !== data.checkins[data.checkins.length - 1]?.CHAVE) {
          fetchData();
        }
      }
    } catch (err) {
      console.error('Erro ao buscar último check-in:', err);
    }
  }, [data, fetchData]);

  const updateFiltros = useCallback((novosFiltros: FiltrosMapa) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  const toggleAtualizacaoAutomatica = useCallback(() => {
    setAtualizacaoAutomatica(prev => !prev);
  }, []);

  // Buscar dados quando os filtros mudarem
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    if (!atualizacaoAutomatica || !filtros.tecnico) return;

    const interval = setInterval(() => {
      fetchUltimoCheckin(filtros.tecnico!);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [atualizacaoAutomatica, filtros.tecnico, fetchUltimoCheckin]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateFiltros,
    filtros,
    ultimoCheckin,
    atualizacaoAutomatica,
    toggleAtualizacaoAutomatica,
  };
}