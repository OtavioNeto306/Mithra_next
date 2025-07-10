import { useState, useCallback } from 'react';

// Interfaces para tipagem dos dados
export interface ResumoGeral {
  TOTAL_PEDIDOS: number;
  TOTAL_VENDAS: number;
  TOTAL_ITENS: number;
  MEDIA_POR_PEDIDO: number;
}

export interface PedidoVenda {
  NUMERO_PEDIDO: string;
  CLIENTE: string;
  VENDEDOR: string;
  EMISSAO: string;
  TOTAL: number;
  FRETE: number;
  STATUS: string;
}

export interface ItemPedido {
  NUMERO_PEDIDO: string;
  PRODUTO: string;
  QUANTIDADE: number;
  VALOR_UNITARIO: number;
  DESCONTO: number;
  TOTAL_ITEM: number;
  CFOP: string;
  ENTREGA: string;
}

export interface ProdutoVendido {
  PRODUTO: string;
  TOTAL_QUANTIDADE: number;
}

export interface VendaDia {
  DIA: string;
  TOTAL_DIA: number;
}

export interface PrevisaoVendasState {
  resumoGeral: ResumoGeral | null;
  pedidos: PedidoVenda[];
  itens: ItemPedido[];
  produtosMaisVendidos: ProdutoVendido[];
  vendasPorDia: VendaDia[];
  loading: boolean;
  error: string | null;
  totalPedidos: number;
}

export interface PrevisaoVendasFilters {
  vendedor: string;
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
  offset?: number;
}

export function usePrevisaoVendas() {
  const [state, setState] = useState<PrevisaoVendasState>({
    resumoGeral: null,
    pedidos: [],
    itens: [],
    produtosMaisVendidos: [],
    vendasPorDia: [],
    loading: false,
    error: null,
    totalPedidos: 0
  });

  // Função para buscar resumo geral
  const fetchResumoGeral = useCallback(async (vendedor: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/previsao-vendas?tipo=resumo-geral&vendedor=${vendedor}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          resumoGeral: data.data[0] || null,
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'Erro ao buscar resumo geral',
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar resumo geral:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro de conexão ao buscar resumo geral',
        loading: false 
      }));
    }
  }, []);

  // Função para buscar listagem de pedidos
  const fetchPedidos = useCallback(async (filters: PrevisaoVendasFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        tipo: 'listagem-pedidos',
        vendedor: filters.vendedor,
        limit: (filters.limit || 10).toString(),
        offset: (filters.offset || 0).toString()
      });

      const response = await fetch(`/api/previsao-vendas?${params}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          pedidos: data.data || [],
          totalPedidos: data.total || 0,
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'Erro ao buscar listagem de pedidos',
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar listagem de pedidos:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro de conexão ao buscar listagem de pedidos',
        loading: false 
      }));
    }
  }, []);

  // Função para buscar itens por pedido
  const fetchItens = useCallback(async (vendedor: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/previsao-vendas?tipo=itens-pedido&vendedor=${vendedor}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          itens: data.data || [],
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'Erro ao buscar itens por pedido',
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar itens por pedido:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro de conexão ao buscar itens por pedido',
        loading: false 
      }));
    }
  }, []);

  // Função para buscar produtos mais vendidos
  const fetchProdutosMaisVendidos = useCallback(async (vendedor: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/previsao-vendas?tipo=produtos-mais-vendidos&vendedor=${vendedor}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          produtosMaisVendidos: data.data || [],
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'Erro ao buscar produtos mais vendidos',
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro de conexão ao buscar produtos mais vendidos',
        loading: false 
      }));
    }
  }, []);

  // Função para buscar vendas por dia
  const fetchVendasPorDia = useCallback(async (vendedor: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`/api/previsao-vendas?tipo=vendas-por-dia&vendedor=${vendedor}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          vendasPorDia: data.data || [],
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'Erro ao buscar vendas por dia',
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar vendas por dia:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro de conexão ao buscar vendas por dia',
        loading: false 
      }));
    }
  }, []);

  // Função para buscar todos os dados
  const fetchAllData = useCallback(async (vendedor: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await Promise.all([
        fetchResumoGeral(vendedor),
        fetchPedidos({ vendedor }),
        fetchItens(vendedor),
        fetchProdutosMaisVendidos(vendedor),
        fetchVendasPorDia(vendedor)
      ]);
    } catch (error) {
      console.error('Erro ao buscar todos os dados:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Erro ao buscar dados da previsão de vendas',
        loading: false 
      }));
    }
  }, [fetchResumoGeral, fetchPedidos, fetchItens, fetchProdutosMaisVendidos, fetchVendasPorDia]);

  // Função para limpar os dados
  const clearData = useCallback(() => {
    setState({
      resumoGeral: null,
      pedidos: [],
      itens: [],
      produtosMaisVendidos: [],
      vendasPorDia: [],
      loading: false,
      error: null,
      totalPedidos: 0
    });
  }, []);

  return {
    ...state,
    fetchResumoGeral,
    fetchPedidos,
    fetchItens,
    fetchProdutosMaisVendidos,
    fetchVendasPorDia,
    fetchAllData,
    clearData
  };
} 