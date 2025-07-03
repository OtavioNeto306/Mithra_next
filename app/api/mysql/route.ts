import { NextRequest, NextResponse } from 'next/server';
import { testMySQLConnection, executeSimpleQuery } from '@/lib/db/mysql-simple';

export async function POST(request: NextRequest) {
  try {
    const { sql, params = [] } = await request.json();

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { error: 'SQL query é obrigatória e deve ser string' },
        { status: 400 }
      );
    }

    console.log('Executando query MySQL:', sql);
    console.log('Parâmetros:', params);

    // Executar a query diretamente
    const result = await executeSimpleQuery(sql, params);
    
    return NextResponse.json({
      result: result,
      sql: sql,
      params: params,
      source: 'mysql-direct',
      timestamp: new Date().toISOString(),
      count: result.length
    });

  } catch (error) {
    console.error('Erro na API MySQL:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao executar query MySQL',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        sql: request.body
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para testar conexão
export async function GET() {
  try {
    const connectionTest = await testMySQLConnection();
    
    return NextResponse.json({
      connected: connectionTest.success,
      timestamp: new Date().toISOString(),
      message: connectionTest.message,
      data: connectionTest.data
    });
  } catch (error) {
    return NextResponse.json(
      { 
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 