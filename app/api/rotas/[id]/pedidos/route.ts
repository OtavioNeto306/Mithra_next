import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/mysql';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // id aqui é o CODIGO da tabela cargas

    const query = `
      SELECT
        i.CLIENTE AS codigoCliente,
        i.VALOR AS valorPedido,
        i.DOCUMENTO AS documentoPedido,
        c.NUMERO AS numeroCabPdv,
        c.CHAVE AS chaveCabPdv,
        c.CLIENTE AS clienteCabPdv,
        c.VALOR AS valorTotalCabPdv,
        c.EMISSAO AS emissaoCabPdv,
        c.OBSERV AS observacaoCabPdv
      FROM
        itecar i
      LEFT JOIN
        cabpdv c ON i.DOCUMENTO = c.NUMERO
      WHERE
        i.CODIGO = ?;
    `;
    let pedidos = await executeQuery(query, [id]);

    // Para cada pedido, buscar seus itens
    pedidos = await Promise.all(pedidos.map(async (pedido: any) => {
      const itensQuery = `
        SELECT
          i.ORDEM,
          i.PRODUTO AS codigoProduto,
          p.DESCRICAO AS nomeProduto,
          p.UNIDADE AS unidadeProduto,
          i.QUANT AS quantidade,
          i.VALUNIT AS valorUnitario,
          i.TOTAL AS totalItem,
          i.PERDSC AS descontoItem
        FROM itepdv i
        LEFT JOIN produt p ON i.PRODUTO = p.CODIGO
        WHERE i.CHAVE = ?
        ORDER BY i.ORDEM;
      `;
      const itens = await executeQuery(itensQuery, [pedido.chaveCabPdv]);
      return { ...pedido, itens };
    }));

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos da rota:', error);
    return NextResponse.json({ message: 'Erro ao buscar pedidos da rota' }, { status: 500 });
  }
}