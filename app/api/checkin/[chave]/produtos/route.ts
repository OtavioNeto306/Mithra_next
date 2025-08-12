import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: { chave: string } }
) {
  try {
    const { chave } = await params;

    if (!chave) {
      return NextResponse.json(
        { error: 'Parâmetro CHAVE é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Buscando produtos para a chave de checkin: ${chave}`);

    const query = `
      SELECT 
        i.CHAVE,
        i.ORDEM,
        i.PRODUTO,
        p.DESCRICAO,
        p.UNIDADE,
        p.GRUPO
      FROM icheckin i
      LEFT JOIN produt p ON i.PRODUTO = p.CODIGO
      WHERE i.CHAVE = ?
      ORDER BY i.ORDEM
    `;
    const productsData = await executeQuery(query, [chave]);

    return NextResponse.json({
      data: productsData,
    });

  } catch (error) {
    console.error('Erro ao buscar produtos do checkin:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar produtos do checkin',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}