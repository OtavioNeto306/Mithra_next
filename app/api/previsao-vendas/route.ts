import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/odbc';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const vendedor = searchParams.get('vendedor');
    const cliente = searchParams.get('cliente');
    const produto = searchParams.get('produto');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    console.log('Parâmetros recebidos:', {
      tipo,
      vendedor,
      cliente,
      produto,
      dataInicio,
      dataFim,
      limit,
      offset
    });

    if (!vendedor) {
      return NextResponse.json({
        success: false,
        error: 'Código do vendedor é obrigatório'
      }, { status: 400 });
    }

    switch (tipo) {
      case 'resumo-geral':
        return await getResumoGeral(vendedor);
      
      case 'listagem-pedidos':
        return await getListagemPedidos(vendedor, limit, offset);
      
      case 'itens-pedido':
        return await getItensPedido(vendedor);
      
      case 'produtos-mais-vendidos':
        return await getProdutosMaisVendidos(vendedor);
      
      case 'vendas-por-dia':
        return await getVendasPorDia(vendedor);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de consulta não especificado ou inválido'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API de previsão de vendas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
    }, { status: 500 });
  }
}

// 1. Resumo Geral de Vendas (últimos 30 dias)
async function getResumoGeral(vendedor: string) {
  try {
    const query = `
      SELECT 
        COUNT(P.PEDI_PED) AS TOTAL_PEDIDOS,
        SUM(REPLACE(P.TOTA_PED, ',', '.')) AS TOTAL_VENDAS,
        SUM(REPLACE(I.QTDE_IPE, ',', '.')) AS TOTAL_ITENS,
        AVG(REPLACE(P.TOTA_PED, ',', '.')) AS MEDIA_POR_PEDIDO
      FROM PEDIDO P
      JOIN IPEDIDO I ON P.PEDI_PED = I.PEDI_PED AND P.SERI_PED = I.SERI_PED
      WHERE P.DEMI_PED >= SYSDATE - 31
        AND P.SERI_PED = '9'
        AND P.COD1_PES = ?
    `;

    const result = await executeQuery(query, [vendedor]);
    
    console.log('Resumo geral - resultado:', result);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar resumo geral:', error);
    throw error;
  }
}

// 2. Listagem de Pedidos (com status e totais)
async function getListagemPedidos(vendedor: string, limit: string, offset: string) {
  try {
    const query = `
      SELECT 
        P.PEDI_PED AS NUMERO_PEDIDO,
        P.CODI_TRA AS CLIENTE,
        P.COD1_PES AS VENDEDOR,
        TO_CHAR(P.DEMI_PED, 'YYYY-MM-DD') AS EMISSAO,
        REPLACE(P.TOTA_PED, ',', '.') AS TOTAL,
        REPLACE(P.VFRT_PED, ',', '.') AS FRETE,
        CONCAT(P.SITU_PED, P.ESTA_PED) AS STATUS
      FROM PEDIDO P
      WHERE P.DEMI_PED >= SYSDATE - 31
        AND P.SERI_PED = '9'
        AND P.COD1_PES = ?
      ORDER BY P.DEMI_PED DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;

    const result = await executeQuery(query, [vendedor, offset, limit]);
    
    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as TOTAL
      FROM PEDIDO P
      WHERE P.DEMI_PED >= SYSDATE - 31
        AND P.SERI_PED = '9'
        AND P.COD1_PES = ?
    `;

    const countResult = await executeQuery(countQuery, [vendedor]);
    
    console.log('Listagem pedidos - resultado:', result);
    console.log('Listagem pedidos - total:', countResult);
    
    return NextResponse.json({
      success: true,
      data: result,
      total: (countResult as any)?.[0]?.TOTAL || 0
    });
  } catch (error) {
    console.error('Erro ao buscar listagem de pedidos:', error);
    throw error;
  }
}

// 3. Itens por Pedido
async function getItensPedido(vendedor: string) {
  try {
    const query = `
      SELECT 
        I.PEDI_PED AS NUMERO_PEDIDO,
        I.CODI_PSV AS PRODUTO,
        REPLACE(I.QTDE_IPE, ',', '.') AS QUANTIDADE,
        REPLACE(I.VLOR_IPE, ',', '.') AS VALOR_UNITARIO,
        REPLACE(I.DSAC_IPE * -1, ',', '.') AS DESCONTO,
        REPLACE(I.VLIQ_IPE, ',', '.') AS TOTAL_ITEM,
        I.CCFO_CFO AS CFOP,
        TO_CHAR(I.DTPR_IPE, 'YYYY-MM-DD') AS ENTREGA
      FROM IPEDIDO I
      JOIN PEDIDO P ON P.PEDI_PED = I.PEDI_PED AND P.SERI_PED = I.SERI_PED
      WHERE P.DEMI_PED >= SYSDATE - 31
        AND P.SERI_PED = '9'
        AND P.COD1_PES = ?
      ORDER BY I.PEDI_PED
    `;

    const result = await executeQuery(query, [vendedor]);
    
    console.log('Itens por pedido - resultado:', result);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar itens por pedido:', error);
    throw error;
  }
}

// 4. Produtos Mais Vendidos (top 10)
async function getProdutosMaisVendidos(vendedor: string) {
  try {
    const query = `
      SELECT 
        I.CODI_PSV AS PRODUTO,
        SUM(REPLACE(I.QTDE_IPE, ',', '.')) AS TOTAL_QUANTIDADE
      FROM IPEDIDO I
      JOIN PEDIDO P ON P.PEDI_PED = I.PEDI_PED AND P.SERI_PED = I.SERI_PED
      WHERE P.DEMI_PED >= SYSDATE - 31
        AND P.SERI_PED = '9'
        AND P.COD1_PES = ?
      GROUP BY I.CODI_PSV
      ORDER BY TOTAL_QUANTIDADE DESC
      FETCH FIRST 10 ROWS ONLY
    `;

    const result = await executeQuery(query, [vendedor]);
    
    console.log('Produtos mais vendidos - resultado:', result);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    throw error;
  }
}

// 5. Vendas por Dia (para gráfico)
async function getVendasPorDia(vendedor: string) {
  try {
    const query = `
      SELECT 
        TO_CHAR(P.DEMI_PED, 'YYYY-MM-DD') AS DIA,
        SUM(REPLACE(P.TOTA_PED, ',', '.')) AS TOTAL_DIA
      FROM PEDIDO P
      WHERE P.DEMI_PED >= SYSDATE - 31
        AND P.SERI_PED = '9'
        AND P.COD1_PES = ?
      GROUP BY TO_CHAR(P.DEMI_PED, 'YYYY-MM-DD')
      ORDER BY DIA
    `;

    const result = await executeQuery(query, [vendedor]);
    
    console.log('Vendas por dia - resultado:', result);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao buscar vendas por dia:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  return NextResponse.json({
    success: false,
    error: 'Método não permitido'
  }, { status: 405 });
} 