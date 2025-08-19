import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/odbc';

interface Produto {
  codigo: string;
  nome: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    // Query para buscar produtos no Oracle via ODBC
    // Usando a estrutura correta da tabela PRODSERV
    let query = `
      SELECT 
        P.CODI_PSV as codigo,
        P.DESC_PSV as nome
      FROM PRODSERV P
      WHERE P.PRSE_PSV = 'P' AND P.SITU_PSV = 'A'
    `;
    
    const params: any[] = [];
    
    // Adicionar filtro de busca se fornecido
    if (search.trim()) {
      query += ` AND (UPPER(P.DESC_PSV) LIKE UPPER(?) OR UPPER(P.CODI_PSV) LIKE UPPER(?))`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ` ORDER BY P.DESC_PSV`;
    
    // Limitar resultados para performance
    if (search.trim()) {
      query += ` FETCH FIRST 20 ROWS ONLY`;
    } else {
      query += ` FETCH FIRST 100 ROWS ONLY`;
    }
    
    console.log('Executando query de produtos:', query);
    console.log('Parâmetros:', params);
    
    const result = await executeQuery(query, params) as Produto[];
    
    if (!result || !Array.isArray(result)) {
      throw new Error('Resultado da query inválido');
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar produtos: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}