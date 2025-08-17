import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chave: string }> }
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
       produto AS PRODUTO,
       quantidade AS QUANTIDADE,
       preco AS PRECO
      FROM icheckin
      WHERE CHAVE = ?
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