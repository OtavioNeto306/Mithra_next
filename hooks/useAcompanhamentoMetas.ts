import { useState, useEffect } from 'react';
import { AcompanhamentoFilter, AcompanhamentoResponse, ProgressoMeta, EvolucaoMensal } from '@/types/metas';

interface UseAcompanhamentoMetasReturn {
  progressos: ProgressoMeta[];
  evolucaoMensal: EvolucaoMensal[];
  resumo: {
    total_metas: number;
    metas_atingidas: number;
    valor_total_metas: number;
    valor_total_realizado: number;
    percentual_geral: number;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAcompanhamentoMetas(filtros: AcompanhamentoFilter = {}): UseAcompanhamentoMetasReturn {
  const [progressos, setProgressos] = useState<ProgressoMeta[]>([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
  const [resumo, setResumo] = useState<{
    total_metas: number;
    metas_atingidas: number;
    valor_total_metas: number;
    valor_total_realizado: number;
    percentual_geral: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcompanhamento = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (filtros.codigo_vendedor) params.append('codigo_vendedor', filtros.codigo_vendedor);
      if (filtros.ano) params.append('ano', filtros.ano.toString());
      if (filtros.mes_inicio) params.append('mes_inicio', filtros.mes_inicio.toString());
      if (filtros.mes_fim) params.append('mes_fim', filtros.mes_fim.toString());
      if (filtros.tipo_meta) params.append('tipo_meta', filtros.tipo_meta);
      if (filtros.codigo_fornecedor) params.append('codigo_fornecedor', filtros.codigo_fornecedor);
      if (filtros.codigo_produto) params.append('codigo_produto', filtros.codigo_produto);
      if (filtros.status) params.append('status', filtros.status);

      const response = await fetch(`/api/acompanhamento-metas?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: AcompanhamentoResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar dados de acompanhamento');
      }

      if (data.data) {
        setProgressos(data.data.progressos);
        setEvolucaoMensal(data.data.evolucao_mensal);
        setResumo(data.data.resumo);
      }
    } catch (err) {
      console.error('Erro ao buscar acompanhamento de metas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcompanhamento();
  }, [
    filtros.codigo_vendedor,
    filtros.ano,
    filtros.mes_inicio,
    filtros.mes_fim,
    filtros.tipo_meta,
    filtros.codigo_fornecedor,
    filtros.codigo_produto,
    filtros.status
  ]);

  return {
    progressos,
    evolucaoMensal,
    resumo,
    loading,
    error,
    refetch: fetchAcompanhamento
  };
}