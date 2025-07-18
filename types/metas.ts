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