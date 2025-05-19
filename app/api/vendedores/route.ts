import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/odbc';

interface Vendedor {
  CODI_PES: string;
  NOME_PES: string;
}

export async function GET() {
  try {
    const query = `
      SELECT 
        P.CODI_PES,
        P.NOME_PES
      FROM PESSOAL P 
      INNER JOIN VENDEDOR V ON P.CODI_PES = V.CODI_PES 
      WHERE P.SITU_PES = 'A'
      ORDER BY P.NOME_PES
    `;

    const result = await executeQuery(query) as Vendedor[];
    
    if (!result || !Array.isArray(result)) {
      throw new Error('Resultado da query inválido');
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar vendedores: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 