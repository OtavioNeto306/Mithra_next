import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db/mysql';

export async function GET(req: NextRequest) {
  try {
    const query = `
      SELECT
        c.CODIGO AS codigoRota,
        c.NOME AS nomeRota,
        c.VENDEDOR AS codigoVendedor,
        c.DATA AS dataRota,
        v.NOME AS nomeVendedor
      FROM
        cargas c
      LEFT JOIN
        vended v ON c.VENDEDOR = v.CODIGO
      ORDER BY
        c.DATA DESC;
    `;
    const rotas = await executeQuery(query);
    return NextResponse.json(rotas);
  } catch (error) {
    console.error('Erro ao buscar rotas:', error);
    return NextResponse.json({ message: 'Erro ao buscar rotas' }, { status: 500 });
  }
}