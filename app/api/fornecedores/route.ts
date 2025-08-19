import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db/odbc';

interface Fornecedor {
  codigo: string;
  nome: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    
    // Query fornecida pelo usuário para buscar fornecedores
    let query = `
      SELECT 
        CODI_TRA as codigo,
        RAZA_TRA as nome
      FROM TRANSAC 
      WHERE FORN_TRA='S'
    `;
    
    const params: any[] = [];
    
    // Adicionar filtro de busca se fornecido
    if (search.trim()) {
      query += ` AND (UPPER(RAZA_TRA) LIKE UPPER(?) OR UPPER(CODI_TRA) LIKE UPPER(?))`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ` ORDER BY RAZA_TRA`;
    
    // Limitar resultados para performance
    if (search.trim()) {
      query += ` FETCH FIRST 20 ROWS ONLY`;
    } else {
      query += ` FETCH FIRST 100 ROWS ONLY`;
    }
    
    console.log('Executando query de fornecedores:', query);
    console.log('Parâmetros:', params);
    
    const result = await executeQuery(query, params) as Fornecedor[];
    
    if (!result || !Array.isArray(result)) {
      throw new Error('Resultado da query inválido');
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar fornecedores: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}