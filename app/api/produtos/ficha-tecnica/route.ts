import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Interface para Ficha Técnica
interface FichaTecnica {
  id?: number;
  codi_psv: string;
  marca?: string;
  modelo?: string;
  peso?: number;
  dimensoes?: string;
  cor?: string;
  material?: string;
  caracteristicas?: string;
  especificacoes_tecnicas?: string;
  observacoes?: string;
  data_cadastro?: string;
  data_atualizacao?: string;
}

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

// GET - Buscar ficha técnica de um produto
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

    let fichaTecnica: FichaTecnica | null = null;

    await executeSQLiteWithRetry(async () => {
      db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      fichaTecnica = await db.get(
        'SELECT * FROM produto_ficha_tecnica WHERE codi_psv = ?',
        [codi_psv.trim()]
      );
    });

    return NextResponse.json({ ficha_tecnica: fichaTecnica });
  } catch (error) {
    console.error('Erro ao buscar ficha técnica:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ficha técnica' },
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

// POST - Criar ou atualizar ficha técnica
export async function POST(request: Request) {
  let db: any = null;
  
  try {
    const dados: FichaTecnica = await request.json();

    if (!dados.codi_psv) {
      return NextResponse.json(
        { error: 'Código do produto é obrigatório' },
        { status: 400 }
      );
    }

    await executeSQLiteWithRetry(async () => {
      db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      // Verificar se já existe uma ficha técnica para este produto
      const fichaExistente = await db.get(
        'SELECT id FROM produto_ficha_tecnica WHERE codi_psv = ?',
        [dados.codi_psv.trim()]
      );

      if (fichaExistente) {
        // Atualizar ficha técnica existente
        await db.run(`
          UPDATE produto_ficha_tecnica SET 
            marca = ?,
            modelo = ?,
            peso = ?,
            dimensoes = ?,
            cor = ?,
            material = ?,
            caracteristicas = ?,
            especificacoes_tecnicas = ?,
            observacoes = ?,
            data_atualizacao = CURRENT_TIMESTAMP
          WHERE codi_psv = ?
        `, [
          dados.marca || null,
          dados.modelo || null,
          dados.peso || null,
          dados.dimensoes || null,
          dados.cor || null,
          dados.material || null,
          dados.caracteristicas || null,
          dados.especificacoes_tecnicas || null,
          dados.observacoes || null,
          dados.codi_psv.trim()
        ]);
      } else {
        // Inserir nova ficha técnica
        await db.run(`
          INSERT INTO produto_ficha_tecnica (
            codi_psv, marca, modelo, peso, dimensoes, cor, material,
            caracteristicas, especificacoes_tecnicas, observacoes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          dados.codi_psv.trim(),
          dados.marca || null,
          dados.modelo || null,
          dados.peso || null,
          dados.dimensoes || null,
          dados.cor || null,
          dados.material || null,
          dados.caracteristicas || null,
          dados.especificacoes_tecnicas || null,
          dados.observacoes || null
        ]);
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Ficha técnica salva com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar ficha técnica:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar ficha técnica' },
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

// DELETE - Remover ficha técnica
export async function DELETE(request: Request) {
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

    await executeSQLiteWithRetry(async () => {
      db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      // Verificar se existe ficha técnica para este produto
      const fichaExistente = await db.get(
        'SELECT id FROM produto_ficha_tecnica WHERE codi_psv = ?',
        [codi_psv.trim()]
      );

      if (!fichaExistente) {
        throw new Error('Nenhuma ficha técnica encontrada para este produto');
      }

      // Remover ficha técnica
      await db.run(
        'DELETE FROM produto_ficha_tecnica WHERE codi_psv = ?',
        [codi_psv.trim()]
      );
    });

    return NextResponse.json({ 
      success: true,
      message: 'Ficha técnica removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover ficha técnica:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
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