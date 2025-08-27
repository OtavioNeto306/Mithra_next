import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, params = [] } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query é obrigatória' },
        { status: 400 }
      );
    }

    // Substituir placeholders ? por parâmetros reais para MySQL
    let finalQuery = query;
    if (params && params.length > 0) {
      let paramIndex = 0;
      finalQuery = query.replace(/\?/g, () => {
        if (paramIndex < params.length) {
          const param = params[paramIndex++];
          if (typeof param === 'string') {
            return `'${param.replace(/'/g, "''")}'`; // Escape single quotes
          }
          return param;
        }
        return '?';
      });
    }

    console.log('Executando query MySQL:', finalQuery);

    // Executar query usando conexão MySQL direta
    try {
      // Fazer chamada para a API MySQL real
      const mysqlResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/mysql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: finalQuery,
          params: []
        })
      });

      if (!mysqlResponse.ok) {
        throw new Error(`Erro MySQL: ${mysqlResponse.statusText}`);
      }

      const mysqlData = await mysqlResponse.json();
      
      return NextResponse.json({
        data: mysqlData.result || mysqlData.data || [],
        query: finalQuery,
        params: params
      });

    } catch (mysqlError) {
      console.error('Erro ao executar query MySQL:', mysqlError);
      
      // Fallback para dados mockados em caso de erro
      let mockData: any[] = [];
      
      if (finalQuery.includes('CABPDV') && finalQuery.includes('COUNT')) {
        mockData = [{ total: 998 }];
      } else if (finalQuery.includes('CABPDV') && finalQuery.includes('LIMIT')) {
        // Simular dados da CABPDV
        mockData = [
          {
            CHAVE: 930,
            NUMERO: '000930',
            CLIENTE: '001001',
            NOME_CLIENTE: 'CLIENTE TESTE 1',
            EMAIL: 'cliente1@teste.com',
            TELEFONE: '11999999999',
            ENDERECO: 'RUA TESTE, 123',
            CGC: '12345678000190',
            FORMPG: '001',
            DESC_FORMPG: 'DINHEIRO',
            CONDICAO: '001',
            EMISSAO: '20250130',
            VALOR: '1500.00',
            TIPO: 'V',
            STATUS: 'A',
            OBSTXT: 'Observação do pedido',
            VENDEDOR: '001'
          },
          {
            CHAVE: 929,
            NUMERO: '000929',
            CLIENTE: '001002',
            NOME_CLIENTE: 'CLIENTE TESTE 2',
            EMAIL: 'cliente2@teste.com',
            TELEFONE: '11888888888',
            ENDERECO: 'AV TESTE, 456',
            CGC: '98765432000180',
            FORMPG: '002',
            DESC_FORMPG: 'CARTÃO',
            CONDICAO: '002',
            EMISSAO: '20250129',
            VALOR: '2300.50',
            TIPO: 'V',
            STATUS: 'F',
            OBSTXT: 'Pedido urgente',
            VENDEDOR: '002'
          }
        ];
      } else if (finalQuery.includes('itepdv') && finalQuery.includes('WHERE i.CHAVE')) {
        // Simular itens do pedido
        mockData = [
          {
            ORDEM: 1,
            PRODUTO: '001001',
            DESC_PRODUTO: 'PRODUTO TESTE 1',
            GRUPO: 'GRUPO1',
            UNIDADE: 'UN',
            QUANT: '10.00',
            VALUNIT: '100.00',
            TOTAL: '1000.00',
            DESCONTO: '0.00',
            CFOP: '5102',
            CST: '00'
          },
          {
            ORDEM: 2,
            PRODUTO: '001002',
            DESC_PRODUTO: 'PRODUTO TESTE 2',
            GRUPO: 'GRUPO2',
            UNIDADE: 'KG',
            QUANT: '5.00',
            VALUNIT: '100.00',
            TOTAL: '500.00',
            DESCONTO: '0.00',
            CFOP: '5102',
            CST: '00'
          }
        ];
      }

      console.log('Usando dados mockados devido a erro MySQL');
      
      return NextResponse.json({
        data: mockData,
        query: finalQuery,
        params: params,
        error: `MySQL Error: ${mysqlError instanceof Error ? mysqlError.message : 'Unknown error'}`,
        usingMockData: true
      });
    }

  } catch (error) {
    console.error('Erro ao executar query:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}