import { useState, useEffect, useCallback } from 'react';

export interface Pedido {
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

export interface PedidoDetalhado extends Pedido {
  cliente: Pedido['cliente'] & {
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
  itens: Array<Pedido['itens'][0] & {
    produto: Pedido['itens'][0]['produto'] & {
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

export interface UsePedidosResult {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchPedidos: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UsePedidoDetalheResult {
  pedido: PedidoDetalhado | null;
  loading: boolean;
  error: string | null;
  fetchPedido: (id: string) => Promise<void>;
}

export function usePedidos(): UsePedidosResult {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
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

  const fetchPedidos = useCallback(async (params?: {
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
      
      const response = await fetch(`/api/pedidos?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPedidos(result.data || []);
      setPagination(result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchPedidos(currentParams);
  }, [fetchPedidos, currentParams]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  return {
    pedidos,
    loading,
    error,
    pagination,
    fetchPedidos,
    refetch,
  };
}

export function usePedidoDetalhe(): UsePedidoDetalheResult {
  const [pedido, setPedido] = useState<PedidoDetalhado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPedido = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/pedidos/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido não encontrado');
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPedido(result.data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar detalhes do pedido:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pedido,
    loading,
    error,
    fetchPedido,
  };
} 