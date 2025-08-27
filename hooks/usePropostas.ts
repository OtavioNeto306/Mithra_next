import { useState, useEffect, useCallback } from 'react';

export interface Proposta {
  chave: number;
  numero: string;
  cliente: {
    codigo: string;
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    cgc?: string;
  };
  formaPagamento: {
    codigo: string;
    descricao: string;
  };
  condicaoPagamento: string;
  emissao: string;
  valor: number;
  tipo: string;
  status: string;
  observacoes?: string;
  vendedor?: string;
  itens: Array<{
    ordem: number;
    produto: {
      codigo: string;
      descricao: string;
      grupo?: string;
      unidade?: string;
    };
    quantidade: number;
    valorUnitario: number;
    total: number;
    desconto: number;
    cfop?: string;
    cst?: string;
  }>;
}

export interface PropostaDetalhada extends Proposta {
  cliente: Proposta['cliente'] & {
    bairro?: string;
    municipio?: string;
    estado?: string;
    cep?: string;
  };
  valorBruto: number;
  valorMercadoria: number;
  desconto: number;
  frete: number;
  observacoesInternas?: string;
  transportadora?: string;
  filial?: string;
  itens: Array<Proposta['itens'][0] & {
    produto: Proposta['itens'][0]['produto'] & {
      grupo?: string;
      unidade?: string;
    };
    cfop?: string;
    cst?: string;
    impostos?: {
      baseIcms?: number;
      aliquotaIcms?: number;
      valorIcms?: number;
    };
  }>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePropostasResult {
  propostas: Proposta[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchPropostas: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UsePropostaDetalheResult {
  proposta: PropostaDetalhada | null;
  loading: boolean;
  error: string | null;
  fetchProposta: (id: string) => Promise<void>;
}

export function usePropostas(): UsePropostasResult {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentParams, setCurrentParams] = useState<{
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }>({});

  const fetchPropostas = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      
      // Sempre enviar valores padrão se não fornecidos
      searchParams.set('page', (params?.page || 1).toString());
      searchParams.set('limit', (params?.limit || 10).toString());
      searchParams.set('search', params?.search || '');
      searchParams.set('status', params?.status || '');
      
      setCurrentParams(params || {});
      
      const response = await fetch(`/api/propostas?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPropostas(result.data || []);
      setPagination(result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar propostas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchPropostas(currentParams);
  }, [fetchPropostas, currentParams]);

  useEffect(() => {
    fetchPropostas();
  }, [fetchPropostas]);

  return {
    propostas,
    loading,
    error,
    pagination,
    fetchPropostas,
    refetch,
  };
}

export function usePropostaDetalhe(): UsePropostaDetalheResult {
  const [proposta, setProposta] = useState<PropostaDetalhada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposta = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/propostas/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Proposta não encontrada');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setProposta(result.data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar detalhes da proposta:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    proposta,
    loading,
    error,
    fetchProposta,
  };
}