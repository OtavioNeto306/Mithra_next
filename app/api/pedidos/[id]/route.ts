import { NextRequest, NextResponse } from 'next/server';

interface PedidoDetalheResponse {
  chave: number;
  numero: string;
  cliente: {
    codigo: string;
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    cgc?: string;
    bairro?: string;
    municipio?: string;
    estado?: string;
    cep?: string;
  };
  formaPagamento: {
    codigo: string;
    descricao: string;
  };
  condicaoPagamento: string;
  emissao: string;
  valor: number;
  valorBruto: number;
  valorMercadoria: number;
  desconto: number;
  frete: number;
  tipo: string;
  status: string;
  observacoes?: string;
  observacoesInternas?: string;
  vendedor?: string;
  transportadora?: string;
  filial?: string;
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
    impostos?: {
      baseIcms?: number;
      aliquotaIcms?: number;
      valorIcms?: number;
    };
  }>;
}

// Função para converter data do formato YYYYMMDD para ISO
function convertDateFromDB(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return new Date().toISOString();
  
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  return `${year}-${month}-${day}`;
}

// Função para converter valor string para number
function convertValueFromDB(valueStr: string): number {
  if (!valueStr) return 0;
  return parseFloat(valueStr.replace(',', '.')) || 0;
}

// Função para mapear status do banco para interface
function mapStatusFromDB(status: string): string {
  switch (status?.toUpperCase()) {
    case 'A': return 'pendente';
    case 'F': return 'faturado';
    case 'C': return 'cancelado';
    case 'P': return 'em processamento';
    default: return 'pendente';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Query para buscar detalhes completos do pedido
    const pedidoQuery = `
      SELECT 
        c.CHAVE,
        c.NUMERO,
        c.CLIENTE,
        cl.NOME as NOME_CLIENTE,
        cl.EMAIL,
        cl.TELEFO as TELEFONE,
        cl.ENDERECO,
        cl.BAIRRO,
        cl.MUNICIPIO,
        cl.ESTADO,
        cl.CEP,
        cl.CGC,
        c.FORMPG,
        f.DESCRICAO as DESC_FORMPG,
        c.CONDICAO,
        c.EMISSAO,
        c.VALOR,
        c.VALBRUT,
        c.VALMERC,
        c.DESCONTO,
        c.FRETE,
        c.TIPO,
        c.STATUS,
        c.OBSTXT,
        c.OBS_INT,
        c.VENDEDOR,
        c.TRANSP,
        c.FILIAL
      FROM CABPDV c 
      LEFT JOIN client cl ON c.CLIENTE = cl.CODIGO 
      LEFT JOIN formpg f ON c.FORMPG = f.CODIGO 
      WHERE c.CHAVE = ?
    `;

    console.log('Buscando pedido:', id);

    const response = await fetch('http://localhost:3000/api/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: pedidoQuery,
        params: [id]
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.statusText}`);
    }

    const { data: pedidos } = await response.json();

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const pedido = pedidos[0];

    // Query para buscar itens do pedido - TABELA CORRETA: itepdv com produt
    const itensQuery = `
      SELECT 
        i.ORDEM,
        i.PRODUTO,
        p.DESCRICAO as DESC_PRODUTO,
        p.GRUPO,
        p.UNIDADE,
        i.QUANT,
        i.VALUNIT,
        i.TOTAL,
        i.PERDSC as DESCONTO,
        i.CFOP,
        '00' as CST,
        i.BASEICM,
        i.ALIQICM,
        i.VALICM
      FROM itepdv i 
      LEFT JOIN produt p ON i.PRODUTO = p.CODIGO 
      WHERE i.CHAVE = ?
      ORDER BY i.ORDEM
    `;

    const itensResponse = await fetch('http://localhost:3000/api/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: itensQuery,
        params: [id]
      })
    });

    let itens = [];
    if (itensResponse.ok) {
      const itensData = await itensResponse.json();
      itens = itensData.data || [];
    }

    // Montar objeto de resposta
    const pedidoDetalhado: PedidoDetalheResponse = {
      chave: pedido.CHAVE,
      numero: pedido.NUMERO || '',
      cliente: {
        codigo: pedido.CLIENTE || '',
        nome: pedido.NOME_CLIENTE || '',
        email: pedido.EMAIL || '',
        telefone: pedido.TELEFONE || '',
        endereco: pedido.ENDERECO || '',
        bairro: pedido.BAIRRO || '',
        municipio: pedido.MUNICIPIO || '',
        estado: pedido.ESTADO || '',
        cep: pedido.CEP || '',
        cgc: pedido.CGC || '',
      },
      formaPagamento: {
        codigo: pedido.FORMPG || '',
        descricao: pedido.DESC_FORMPG || '',
      },
      condicaoPagamento: pedido.CONDICAO || '',
      emissao: convertDateFromDB(pedido.EMISSAO),
      valor: convertValueFromDB(pedido.VALOR),
      valorBruto: convertValueFromDB(pedido.VALBRUT),
      valorMercadoria: convertValueFromDB(pedido.VALMERC),
      desconto: convertValueFromDB(pedido.DESCONTO),
      frete: convertValueFromDB(pedido.FRETE),
      tipo: pedido.TIPO || '',
      status: mapStatusFromDB(pedido.STATUS),
      observacoes: pedido.OBSTXT || '',
      observacoesInternas: pedido.OBS_INT || '',
      vendedor: pedido.VENDEDOR || '',
      transportadora: pedido.TRANSP || '',
      filial: pedido.FILIAL || '',
      itens: itens.map((item: any) => ({
        ordem: item.ORDEM || 0,
        produto: {
          codigo: item.PRODUTO || '',
          descricao: item.DESC_PRODUTO || '',
          grupo: item.GRUPO || '',
          unidade: item.UNIDADE || '',
        },
        quantidade: convertValueFromDB(item.QUANT),
        valorUnitario: convertValueFromDB(item.VALUNIT),
        total: convertValueFromDB(item.TOTAL),
        desconto: convertValueFromDB(item.DESCONTO),
        cfop: item.CFOP || '',
        cst: item.CST || '',
        impostos: {
          baseIcms: convertValueFromDB(item.BASEICM),
          aliquotaIcms: convertValueFromDB(item.ALQICM),
          valorIcms: convertValueFromDB(item.VALICM),
        }
      }))
    };

    return NextResponse.json({
      data: pedidoDetalhado
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 