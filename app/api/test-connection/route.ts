import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db/odbc';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Conexão estabelecida com sucesso'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Falha ao estabelecer conexão'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao testar conexão: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 