import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ApiValidator } from '@/lib/validation';

interface PropostaResponse {
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

// Função para mapear status do banco para interface - ESPECÍFICO PARA PROPOSTAS
function mapStatusFromDB(status: string): string {
  switch (status?.toUpperCase()) {
    case 'B': return 'aprovado';
    case 'L': return 'reprovado';
    case 'R': return 'expirado';
    case 'E': return 'outros';
    default: return 'pendente';
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair e validar parâmetros
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    // Validar parâmetros
    const paginationValidation = ApiValidator.validatePagination(page, limit);
    const searchValidation = ApiValidator.validateSearch(search);
    const statusValidation = ApiValidator.validateStatus(status);
    
    const validationResult = ApiValidator.combineResults(
      paginationValidation,
      searchValidation,
      statusValidation
    );
    
    if (!validationResult.isValid) {
      const firstError = validationResult.getFirstError();
      logger.warn('Validação de parâmetros falhou', { errors: validationResult.errors });
      
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos',
          details: firstError?.message || 'Erro de validação',
          field: firstError?.field
        },
        { status: 400 }
      );
    }
    
    // Converter parâmetros validados
    const pageNum = ApiValidator.parseInt(page, 1);
    const limitNum = ApiValidator.parseInt(limit, 10);
    const searchSanitized = ApiValidator.sanitizeString(search);
    const statusSanitized = status.toLowerCase();
    
    const offset = (pageNum - 1) * limitNum;

    // Query para buscar propostas com informações básicas
    let whereConditions = ['c.TIPO = ?']; // FILTRO FIXO PARA TIPO = P
    const queryParams: any[] = ['P'];

    // Filtro de busca
    if (searchSanitized) {
      whereConditions.push(`(c.NUMERO LIKE ? OR cl.NOME LIKE ?)`);
      queryParams.push(`%${searchSanitized}%`, `%${searchSanitized}%`);
    }

    // Filtro de status - mapeamento específico para propostas
    if (statusSanitized && statusSanitized !== 'todos') {
      const dbStatus = statusSanitized === 'aprovado' ? 'B' : 
                      statusSanitized === 'reprovado' ? 'L' :
                      statusSanitized === 'expirado' ? 'R' :
                      statusSanitized === 'outros' ? 'E' : '';
      if (dbStatus) {
        whereConditions.push('c.STATUS = ?');
        queryParams.push(dbStatus);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Query principal para buscar propostas
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

    queryParams.push(limitNum, offset);

    logger.sql(mainQuery, queryParams);

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/execute-query`, {
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

    const { data: propostas } = await response.json();

    // Para cada proposta, buscar os itens
    const propostasCompletas: PropostaResponse[] = [];

    for (const proposta of propostas) {
      // Query para buscar itens da proposta
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

      const itensResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/execute-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: itensQuery,
          params: [proposta.CHAVE]
        })
      });

      let itens = [];
      if (itensResponse.ok) {
        const itensData = await itensResponse.json();
        itens = itensData.data || [];
      }

      // Montar objeto da proposta
      const propostaCompleta: PropostaResponse = {
        chave: proposta.CHAVE,
        numero: proposta.NUMERO || '',
        cliente: {
          codigo: proposta.CLIENTE || '',
          nome: proposta.NOME_CLIENTE || '',
          email: proposta.EMAIL || '',
          telefone: proposta.TELEFONE || '',
          endereco: proposta.ENDERECO || '',
          cgc: proposta.CGC || '',
        },
        formaPagamento: {
          codigo: proposta.FORMPG || '',
          descricao: proposta.DESC_FORMPG || '',
        },
        condicaoPagamento: proposta.CONDICAO || '',
        emissao: convertDateFromDB(proposta.EMISSAO),
        valor: convertValueFromDB(proposta.VALOR),
        tipo: proposta.TIPO || '',
        status: mapStatusFromDB(proposta.STATUS),
        observacoes: proposta.OBSTXT || '',
        vendedor: proposta.VENDEDOR || '',
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

      propostasCompletas.push(propostaCompleta);
    }

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM CABPDV c 
      LEFT JOIN client cl ON c.CLIENTE = cl.CODIGO 
      WHERE ${whereClause}
    `;

    const countResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/execute-query`, {
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

    const duration = Date.now() - startTime;
    logger.api('GET /api/propostas', { page: pageNum, limit: limitNum, search: searchSanitized, status: statusSanitized }, duration);

    return NextResponse.json({
      data: propostasCompletas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar propostas', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}