import { NextRequest, NextResponse } from 'next/server';

interface PedidoResponse {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;

    // Query para buscar pedidos com informações básicas
    let whereConditions = ['1=1'];
    const queryParams: any[] = [];

    // Filtro de busca
    if (search) {
      whereConditions.push(`(c.NUMERO LIKE ? OR cl.NOME LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Filtro de status
    if (status && status !== 'todos') {
      const dbStatus = status === 'pendente' ? 'A' : 
                      status === 'faturado' ? 'F' :
                      status === 'cancelado' ? 'C' :
                      status === 'em processamento' ? 'P' : '';
      if (dbStatus) {
        whereConditions.push('c.STATUS = ?');
        queryParams.push(dbStatus);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Query principal para buscar pedidos
    const mainQuery = `
      SELECT 
        c.CHAVE,
        c.NUMERO,
        c.CLIENTE,
        cl.NOME as NOME_CLIENTE,
        cl.EMAIL,
        cl.TELEFO as TELEFONE,
        cl.ENDERECO,
        cl.CGC,
        c.FORMPG,
        f.DESCRICAO as DESC_FORMPG,
        c.CONDICAO,
        c.EMISSAO,
        c.VALOR,
        c.TIPO,
        c.STATUS,
        c.OBSTXT,
        c.VENDEDOR
      FROM CABPDV c 
      LEFT JOIN client cl ON c.CLIENTE = cl.CODIGO 
      LEFT JOIN formpg f ON c.FORMPG = f.CODIGO 
      WHERE ${whereClause}
      ORDER BY c.CHAVE DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    console.log('Executando query principal:', mainQuery);
    console.log('Parâmetros:', queryParams);

    const response = await fetch('http://localhost:3000/api/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mainQuery,
        params: queryParams
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.statusText}`);
    }

    const { data: pedidos } = await response.json();

    // Para cada pedido, buscar os itens
    const pedidosCompletos: PedidoResponse[] = [];

    for (const pedido of pedidos) {
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
          '00' as CST
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
          params: [pedido.CHAVE]
        })
      });

      let itens = [];
      if (itensResponse.ok) {
        const itensData = await itensResponse.json();
        itens = itensData.data || [];
      }

      // Montar objeto do pedido
      const pedidoCompleto: PedidoResponse = {
        chave: pedido.CHAVE,
        numero: pedido.NUMERO || '',
        cliente: {
          codigo: pedido.CLIENTE || '',
          nome: pedido.NOME_CLIENTE || '',
          email: pedido.EMAIL || '',
          telefone: pedido.TELEFONE || '',
          endereco: pedido.ENDERECO || '',
          cgc: pedido.CGC || '',
        },
        formaPagamento: {
          codigo: pedido.FORMPG || '',
          descricao: pedido.DESC_FORMPG || '',
        },
        condicaoPagamento: pedido.CONDICAO || '',
        emissao: convertDateFromDB(pedido.EMISSAO),
        valor: convertValueFromDB(pedido.VALOR),
        tipo: pedido.TIPO || '',
        status: mapStatusFromDB(pedido.STATUS),
        observacoes: pedido.OBSTXT || '',
        vendedor: pedido.VENDEDOR || '',
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
        }))
      };

      pedidosCompletos.push(pedidoCompleto);
    }

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM CABPDV c 
      LEFT JOIN client cl ON c.CLIENTE = cl.CODIGO 
      WHERE ${whereClause}
    `;

    const countResponse = await fetch('http://localhost:3000/api/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: countQuery,
        params: queryParams.slice(0, -2) // Remove limit e offset
      })
    });

    let total = 0;
    if (countResponse.ok) {
      const countData = await countResponse.json();
      total = countData.data[0]?.total || 0;
    }

    return NextResponse.json({
      data: pedidosCompletos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 