import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Função auxiliar para executar operação SQLite com retry
async function executeSQLiteWithRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (error.code === 'SQLITE_BUSY' && attempt < maxRetries) {
        console.log(`⚠️ SQLITE_BUSY na tentativa ${attempt}, tentando novamente em ${attempt * 100}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 100));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Máximo de tentativas excedido');
}

export async function GET(request: Request) {
  let db: any = null;
  
  try {
    const { searchParams } = new URL(request.url);
    const codi_psv = searchParams.get('codi_psv');

    if (!codi_psv) {
      return NextResponse.json(
        { error: 'Código do produto é obrigatório' },
        { status: 400 }
      );
    }

    let imagens: any = null;

    await executeSQLiteWithRetry(async () => {
      db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      imagens = await db.all(
        'SELECT * FROM produto_imagens WHERE codi_psv = ? ORDER BY data_cadastro DESC',
        [codi_psv]
      );
    });

    return NextResponse.json({ imagens });
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar imagens' },
      { status: 500 }
    );
  } finally {
    if (db) {
      try {
        await db.close();
      } catch (closeError) {
        console.error('⚠️ Erro ao fechar conexão SQLite:', closeError);
      }
    }
  }
}

export async function POST(request: Request) {
  let db: any = null;
  
  try {
    const { codi_psv, url_imagem } = await request.json();

    if (!codi_psv || !url_imagem) {
      return NextResponse.json(
        { error: 'Código do produto e URL da imagem são obrigatórios' },
        { status: 400 }
      );
    }

    await executeSQLiteWithRetry(async () => {
      db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      // Verificar se já existe uma imagem para este produto
      const imagemExistente = await db.get(
        'SELECT id FROM produto_imagens WHERE codi_psv = ?',
        [codi_psv]
      );

      if (imagemExistente) {
        // Atualizar imagem existente
        await db.run(
          'UPDATE produto_imagens SET url_imagem = ?, data_cadastro = CURRENT_TIMESTAMP WHERE codi_psv = ?',
          [url_imagem, codi_psv]
        );
      } else {
        // Inserir nova imagem
        await db.run(
          'INSERT INTO produto_imagens (codi_psv, url_imagem) VALUES (?, ?)',
          [codi_psv, url_imagem]
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar imagem' },
      { status: 500 }
    );
  } finally {
    if (db) {
      try {
        await db.close();
      } catch (closeError) {
        console.error('⚠️ Erro ao fechar conexão SQLite:', closeError);
      }
    }
  }
} 