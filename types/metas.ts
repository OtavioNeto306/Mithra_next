// Interfaces para o sistema de metas de vendedores

export interface Meta {
  id: number;
  codigo_vendedor: string;
  ano: number;
  mes: number;
  tipo_meta: 'fornecedor' | 'produto';
  codigo_fornecedor?: string;
  codigo_produto?: string;
  valor_meta: number;
  observacoes?: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface MetaCreate {
  codigo_vendedor: string;
  ano: number;
  mes: number;
  tipo_meta: 'fornecedor' | 'produto';
  codigo_fornecedor?: string;
  codigo_produto?: string;
  valor_meta: number;
  observacoes?: string;
}

export interface MetaUpdate {
  codigo_vendedor?: string;
  ano?: number;
  mes?: number;
  tipo_meta?: 'fornecedor' | 'produto';
  codigo_fornecedor?: string;
  codigo_produto?: string;
  valor_meta?: number;
  observacoes?: string;
}

export interface MetaFilter {
  codigo_vendedor?: string;
  ano?: number;
  mes?: number;
  tipo_meta?: 'fornecedor' | 'produto';
  page?: number;
  limit?: number;
}

export interface MetaResponse {
  success: boolean;
  data?: Meta | Meta[];
  message?: string;
  error?: string;
  paginacao?: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface Vendedor {
  CODI_PES: string;
  NOME_PES: string;
}

export interface Fornecedor {
  CODI_GPR: string;
  DESC_GPR: string;
}

export interface Produto {
  CODI_PSV: string;
  DESC_PSV: string;
}

export interface MetasStats {
  total_metas: number;
  total_valor: number;
  metas_por_tipo: {
    fornecedor: number;
    produto: number;
  };
  metas_por_mes: {
    [mes: number]: number;
  };
}

// Interfaces para acompanhamento de metas
export interface VendaRealizada {
  id: number;
  codigo_vendedor: string;
  ano: number;
  mes: number;
  tipo_venda: 'fornecedor' | 'produto';
  codigo_fornecedor?: string;
  codigo_produto?: string;
  valor_vendido: number;
  quantidade_vendida?: number;
  data_venda: string;
  numero_pedido?: string;
}

export interface ProgressoMeta {
  meta_id: number;
  codigo_vendedor: string;
  nome_vendedor: string;
  ano: number;
  mes: number;
  tipo_meta: 'fornecedor' | 'produto';
  codigo_fornecedor?: string;
  codigo_produto?: string;
  valor_meta: number;
  valor_realizado: number;
  percentual_atingido: number;
  status: 'nao_iniciado' | 'em_andamento' | 'atingida' | 'superada';
  diferenca: number; // valor_realizado - valor_meta
  vendas: VendaRealizada[];
}

export interface AcompanhamentoFilter {
  codigo_vendedor?: string;
  ano?: number;
  mes_inicio?: number;
  mes_fim?: number;
  tipo_meta?: 'fornecedor' | 'produto';
  codigo_fornecedor?: string;
  codigo_produto?: string;
  status?: 'nao_iniciado' | 'em_andamento' | 'atingida' | 'superada';
}

export interface EvolucaoMensal {
  mes: number;
  ano: number;
  mes_nome: string;
  valor_meta: number;
  valor_realizado: number;
  percentual: number;
}

export interface AcompanhamentoResponse {
  success: boolean;
  data?: {
    progressos: ProgressoMeta[];
    evolucao_mensal: EvolucaoMensal[];
    resumo: {
      total_metas: number;
      metas_atingidas: number;
      valor_total_metas: number;
      valor_total_realizado: number;
      percentual_geral: number;
    };
  };
  message?: string;
  error?: string;
}

export interface DadosMockados {
  vendas_realizadas: VendaRealizada[];
  progressos: ProgressoMeta[];
}