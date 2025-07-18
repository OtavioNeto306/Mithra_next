import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MetaUpdate } from '@/types/metas';

// Função auxiliar para abrir conexão com SQLite
async function openDb() {
  return await open({
    filename: 'usuarios.db3',
    driver: sqlite3.Database
  });
}

// Função auxiliar para executar operações SQLite com retry
async function executeSQLiteWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error.code === 'SQLITE_BUSY' && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

// GET - Buscar meta específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let db: any = null;

  try {
    const { id } = await params;
    const metaId = parseInt(id);

    if (isNaN(metaId)) {
      return NextResponse.json(
        { success: false, error: 'ID da meta inválido' },
        { status: 400 }
      );
    }

    await executeSQLiteWithRetry(async () => {
      db = await openDb();

      const meta = await db.get(
        'SELECT * FROM metas_vendedores WHERE id = ?',
        [metaId]
      );

      if (!meta) {
        return NextResponse.json(
          { success: false, error: 'Meta não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: meta
      });
    });

    return NextResponse.json({
      success: false,
      error: 'Meta não encontrada'
    }, { status: 404 });

  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar meta' },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

// PUT - Atualizar meta existente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let db: any = null;

  try {
    const { id } = await params;
    const metaId = parseInt(id);
    const metaUpdate: MetaUpdate = await request.json();

    if (isNaN(metaId)) {
      return NextResponse.json(
        { success: false, error: 'ID da meta inválido' },
        { status: 400 }
      );
    }

    // Validações básicas
    if (metaUpdate.ano && (metaUpdate.ano < 2020 || metaUpdate.ano > 2030)) {
      return NextResponse.json(
        { success: false, error: 'Ano deve estar entre 2020 e 2030' },
        { status: 400 }
      );
    }

    if (metaUpdate.mes && (metaUpdate.mes < 1 || metaUpdate.mes > 12)) {
      return NextResponse.json(
        { success: false, error: 'Mês deve estar entre 1 e 12' },
        { status: 400 }
      );
    }

    if (metaUpdate.tipo_meta && !['fornecedor', 'produto'].includes(metaUpdate.tipo_meta)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de meta deve ser "fornecedor" ou "produto"' },
        { status: 400 }
      );
    }

    if (metaUpdate.valor_meta && metaUpdate.valor_meta <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor da meta deve ser maior que zero' },
        { status: 400 }
      );
    }

    await executeSQLiteWithRetry(async () => {
      db = await openDb();

      // Verificar se a meta existe
      const metaExistente = await db.get(
        'SELECT * FROM metas_vendedores WHERE id = ?',
        [metaId]
      );

      if (!metaExistente) {
        throw new Error('Meta não encontrada');
      }

      // Construir query de atualização
      const updates: string[] = [];
      const params: any[] = [];

      if (metaUpdate.codigo_vendedor !== undefined) {
        updates.push('codigo_vendedor = ?');
        params.push(metaUpdate.codigo_vendedor);
      }

      if (metaUpdate.ano !== undefined) {
        updates.push('ano = ?');
        params.push(metaUpdate.ano);
      }

      if (metaUpdate.mes !== undefined) {
        updates.push('mes = ?');
        params.push(metaUpdate.mes);
      }

      if (metaUpdate.tipo_meta !== undefined) {
        updates.push('tipo_meta = ?');
        params.push(metaUpdate.tipo_meta);
      }

      if (metaUpdate.codigo_fornecedor !== undefined) {
        updates.push('codigo_fornecedor = ?');
        params.push(metaUpdate.codigo_fornecedor);
      }

      if (metaUpdate.codigo_produto !== undefined) {
        updates.push('codigo_produto = ?');
        params.push(metaUpdate.codigo_produto);
      }

      if (metaUpdate.valor_meta !== undefined) {
        updates.push('valor_meta = ?');
        params.push(metaUpdate.valor_meta);
      }

      if (metaUpdate.observacoes !== undefined) {
        updates.push('observacoes = ?');
        params.push(metaUpdate.observacoes);
      }

      if (updates.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Nenhuma alteração realizada'
        });
      }

      // Adicionar ID ao final dos parâmetros
      params.push(metaId);

      // Executar atualização
      await db.run(
        `UPDATE metas_vendedores SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return NextResponse.json({
        success: true,
        message: 'Meta atualizada com sucesso'
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Meta atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao atualizar meta:', error);
    
    if (error.message.includes('Meta não encontrada')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar meta' },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

// DELETE - Excluir meta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let db: any = null;

  try {
    const { id } = await params;
    const metaId = parseInt(id);

    if (isNaN(metaId)) {
      return NextResponse.json(
        { success: false, error: 'ID da meta inválido' },
        { status: 400 }
      );
    }

    await executeSQLiteWithRetry(async () => {
      db = await openDb();

      // Verificar se a meta existe
      const metaExistente = await db.get(
        'SELECT id FROM metas_vendedores WHERE id = ?',
        [metaId]
      );

      if (!metaExistente) {
        throw new Error('Meta não encontrada');
      }

      // Excluir meta
      await db.run('DELETE FROM metas_vendedores WHERE id = ?', [metaId]);

      return NextResponse.json({
        success: true,
        message: 'Meta excluída com sucesso'
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Meta excluída com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao excluir meta:', error);
    
    if (error.message.includes('Meta não encontrada')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao excluir meta' },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
} 