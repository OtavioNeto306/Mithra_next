import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

interface Vendedor {
  codigo: string;
  nome: string;
}

export async function GET() {
  try {
    const db = await open({
      filename: 'usuarios.db3',
      driver: sqlite3.Database
    });

    // Buscar vendedores da tabela USERCC no SQLite
    const query = `
      SELECT 
        USUARIO as codigo,
        NOME as nome
      FROM USERCC 
      WHERE BLOQUEADO IS NULL OR BLOQUEADO = 0
      ORDER BY NOME
    `;

    const result = await db.all(query) as Vendedor[];
    await db.close();
    
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