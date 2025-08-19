import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/odbc';

interface Produto {
  codigo: string;
  nome: string;
}

// Dados mockados para fallback quando não há conexão com Oracle
const produtosMock: Produto[] = [
  { codigo: '0000001', nome: 'Banheira Hidromassagem Premium' },
  { codigo: '0000002', nome: 'Bancada de Granito Preto' },
  { codigo: '0000003', nome: 'Bandeja Decorativa Madeira' },
  { codigo: '0000004', nome: 'Banco de Jardim Ferro' },
  { codigo: '0000005', nome: 'Banqueta Alta Aço Inox' },
  { codigo: '0000006', nome: 'Colchão Ortopédico Queen' },
  { codigo: '0000007', nome: 'Mesa de Centro Vidro' },
  { codigo: '0000008', nome: 'Cadeira Escritório Ergonômica' },
  { codigo: '0000009', nome: 'Sofá 3 Lugares Couro' },
  { codigo: '0000010', nome: 'Estante Livros MDF' }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    
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
    
    try {
      const result = await executeQuery(query, params) as Produto[];
      
      if (!result || !Array.isArray(result)) {
        throw new Error('Resultado da query inválido');
      }
      
      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (dbError) {
      console.warn('Erro de conexão com Oracle, usando dados mockados:', dbError);
      
      // Fallback: usar dados mockados quando não há conexão
      const searchTerm = search.toLowerCase().trim();
      const filteredProducts = searchTerm 
        ? produtosMock.filter(produto => 
            produto.nome.toLowerCase().includes(searchTerm) ||
            produto.codigo.toLowerCase().includes(searchTerm)
          )
        : produtosMock.slice(0, 10);
      
      return NextResponse.json({
        success: true,
        data: filteredProducts,
        fallback: true,
        message: 'Usando dados de demonstração (sem conexão Oracle)'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar produtos: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}