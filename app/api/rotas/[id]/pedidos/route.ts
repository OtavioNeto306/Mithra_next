import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/mysql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // id aqui é o CODIGO da tabela cargas

    const query = `
      SELECT
        i.CLIENTE AS cliente,
        i.DOCUMENTO AS documento,
        i.VALOR AS valor,
        cl.ENDERECO AS endereco,
        cl.MUNICIPIO AS municipio,
        cl.ESTADO AS estado,
        cl.BAIRRO AS bairro,
        cl.CEP AS cep,
        cl.FONE002 AS telefone
      FROM
        itecar i
      JOIN
        cargas c ON i.CODIGO = c.CODIGO
      LEFT JOIN
        client cl ON i.CLIENTE = cl.CODIGO
      WHERE
        c.CODIGO = ?;
    `;
    let pedidos = await executeQuery(query, [id]);

    // Garantir que o valor seja um número
    pedidos = pedidos.map((pedido: any) => ({
      ...pedido,
      valor: parseFloat(pedido.valor)
    }));

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos da rota:', error);
    return NextResponse.json({ message: 'Erro ao buscar pedidos da rota' }, { status: 500 });
  }
}