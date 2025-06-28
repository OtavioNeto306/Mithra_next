import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/odbc';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { sqlParams } from '@/lib/db/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const busca = searchParams.get('busca') || '';
    const start = (page - 1) * limit + 1;
    const end = page * limit;

    // Construir a condição de busca
    let whereBusca = busca 
      ? `AND (P.CODI_PSV LIKE '%${busca}%' OR P.DESC_PSV LIKE '%${busca}%')`
      : '';

    if (sqlParams.produtos.empresas.length != 0) {
      whereBusca += " AND D.CODI_EMP IN (' " + sqlParams.produtos.empresas.join("','") + "') ";
    }
    if (sqlParams.produtos.subgrupos.length != 0) {
      whereBusca += " AND P.CODI_SBG IN (' " + sqlParams.produtos.subgrupos.join("','") + "') ";
    }
    if (sqlParams.produtos.grupos.length != 0) {
      whereBusca += " AND P.CODI_GPR IN (' " + sqlParams.produtos.grupos.join("','") + "') ";
    }

    // Contar total de produtos únicos
    const countResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM (
        SELECT DISTINCT P.CODI_PSV, P.DESC_PSV
        FROM PRODSERV P
        INNER JOIN DADOSPRO D ON P.CODI_PSV = D.CODI_PSV
        WHERE P.PRSE_PSV = 'P' AND P.SITU_PSV = 'A'
        ${whereBusca}
      )
    `) as any[];
    const total = countResult[0]?.TOTAL || 0;
    const totalPaginas = Math.ceil(total / limit);
    console.log('Total de produtos:', total, 'Total de páginas:', totalPaginas);

    // Paginação real com DISTINCT antes do ROW_NUMBER
    const sql = `
      SELECT CODI_PSV, DESC_PSV FROM (
        SELECT CODI_PSV, DESC_PSV, ROW_NUMBER() OVER (ORDER BY CODI_PSV) AS rn
        FROM (
          SELECT DISTINCT P.CODI_PSV, P.DESC_PSV
          FROM PRODSERV P
          INNER JOIN DADOSPRO D ON P.CODI_PSV = D.CODI_PSV
          WHERE P.PRSE_PSV = 'P' AND P.SITU_PSV = 'A'
          ${whereBusca}
        )
      )
      WHERE rn BETWEEN ${start} AND ${end}
    `;
    console.log('Página:', page, 'Limite:', limit, 'Start:', start, 'End:', end);
    console.log('SQL executado:', sql);

    const produtos = await executeQuery(sql);
    console.log('Quantidade de produtos retornados:', Array.isArray(produtos) ? produtos.length : 0);

    const produtosArray = Array.isArray(produtos) ? produtos : [];

    // Buscar imagens dos produtos no SQLite
    if (produtosArray.length > 0) {
      const db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      const produtosComImagem = await Promise.all(
        produtosArray.map(async (produto: any) => {
          try {
            const imagem = await db.get(
              'SELECT url_imagem FROM produto_imagens WHERE codi_psv = ? ORDER BY data_cadastro DESC LIMIT 1',
              [produto.CODI_PSV.trim()]
            );
            return {
              ...produto,
              url_imagem: imagem?.url_imagem || null
            };
          } catch (error) {
            console.error(`Erro ao buscar imagem do produto ${produto.CODI_PSV}:`, error);
            return {
              ...produto,
              url_imagem: null
            };
          }
        })
      );

      await db.close();

      return NextResponse.json({
        produtos: produtosComImagem,
        paginacao: {
          total,
          pagina: page,
          limite: limit,
          totalPaginas
        }
      });
    }

    return NextResponse.json({
      produtos: produtosArray,
      paginacao: {
        total,
        pagina: page,
        limite: limit,
        totalPaginas
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({
      produtos: [],
      paginacao: {
        total: 0,
        pagina: 1,
        limite: 50,
        totalPaginas: 0
      }
    }, { status: 200 });
  }
} 