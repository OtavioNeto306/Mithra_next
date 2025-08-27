import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MetaCreate, MetaUpdate, MetaResponse } from '@/types/metas';

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

// GET - Listar metas com filtros e paginação
export async function GET(request: Request) {
  let db: any = null;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const codigo_vendedor = searchParams.get('codigo_vendedor');
    const ano = searchParams.get('ano');
    const mes = searchParams.get('mes');
    const tipo_meta = searchParams.get('tipo_meta');

    const offset = (page - 1) * limit;

    const result = await executeSQLiteWithRetry(async () => {
      db = await openDb();

      // Construir condições WHERE
      const conditions: string[] = ['1=1'];
      const params: any[] = [];

      if (codigo_vendedor) {
        conditions.push('codigo_vendedor = ?');
        params.push(codigo_vendedor);
      }

      if (ano) {
        conditions.push('ano = ?');
        params.push(parseInt(ano));
      }

      if (mes) {
        conditions.push('mes = ?');
        params.push(parseInt(mes));
      }

      if (tipo_meta) {
        conditions.push('tipo_meta = ?');
        params.push(tipo_meta);
      }

      const whereClause = conditions.join(' AND ');

      // Contar total de registros
      const countResult = await db.get(
        `SELECT COUNT(*) as total FROM metas_vendedores WHERE ${whereClause}`,
        params
      );
      const total = countResult.total;

      // Buscar metas com paginação
      const metas = await db.all(
        `SELECT * FROM metas_vendedores 
         WHERE ${whereClause}
         ORDER BY ano DESC, mes DESC, codigo_vendedor
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const totalPaginas = Math.ceil(total / limit);

      return {
        success: true,
        data: metas,
        paginacao: {
          total,
          pagina: page,
          limite: limit,
          totalPaginas
        }
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar metas' },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

// POST - Criar nova meta
export async function POST(request: Request) {
  let db: any = null;

  try {
    const meta: MetaCreate = await request.json();

    // Validações básicas
    if (!meta.codigo_vendedor) {
      return NextResponse.json(
        { success: false, error: 'Código do vendedor é obrigatório' },
        { status: 400 }
      );
    }

    if (!meta.ano || meta.ano < 2020 || meta.ano > 2030) {
      return NextResponse.json(
        { success: false, error: 'Ano deve estar entre 2020 e 2030' },
        { status: 400 }
      );
    }

    if (!meta.mes || meta.mes < 1 || meta.mes > 12) {
      return NextResponse.json(
        { success: false, error: 'Mês deve estar entre 1 e 12' },
        { status: 400 }
      );
    }

    if (!meta.tipo_meta || !['fornecedor', 'produto'].includes(meta.tipo_meta)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de meta deve ser "fornecedor" ou "produto"' },
        { status: 400 }
      );
    }

    // Validar que pelo menos um tipo de meta foi preenchido
    if ((!meta.valor_meta || meta.valor_meta <= 0) && (!meta.quantidade_meta || meta.quantidade_meta <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Pelo menos um tipo de meta (valor ou quantidade) deve ser preenchido' },
        { status: 400 }
      );
    }

    if (meta.tipo_meta === 'fornecedor' && !meta.codigo_fornecedor) {
      return NextResponse.json(
        { success: false, error: 'Código do fornecedor é obrigatório para meta por fornecedor' },
        { status: 400 }
      );
    }

    if (meta.tipo_meta === 'produto' && !meta.codigo_produto) {
      return NextResponse.json(
        { success: false, error: 'Código do produto é obrigatório para meta por produto' },
        { status: 400 }
      );
    }

    await executeSQLiteWithRetry(async () => {
      db = await openDb();

      // Verificar se já existe uma meta para o mesmo vendedor, período e tipo
      const metaExistente = await db.get(
        `SELECT id FROM metas_vendedores 
         WHERE codigo_vendedor = ? 
         AND ano = ? 
         AND mes = ? 
         AND tipo_meta = ?
         AND COALESCE(codigo_fornecedor, '') = COALESCE(?, '')
         AND COALESCE(codigo_produto, '') = COALESCE(?, '')`,
        [
          meta.codigo_vendedor,
          meta.ano,
          meta.mes,
          meta.tipo_meta,
          meta.codigo_fornecedor || '',
          meta.codigo_produto || ''
        ]
      );

      if (metaExistente) {
        throw new Error('Já existe uma meta para este vendedor, período e tipo');
      }

      // Inserir nova meta
      const result = await db.run(
        `INSERT INTO metas_vendedores (
          codigo_vendedor, ano, mes, tipo_meta, codigo_fornecedor, 
          codigo_produto, valor_meta, quantidade_meta, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          meta.codigo_vendedor,
          meta.ano,
          meta.mes,
          meta.tipo_meta,
          meta.codigo_fornecedor || null,
          meta.codigo_produto || null,
          meta.valor_meta || null,
          meta.quantidade_meta || null,
          meta.observacoes || null
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Meta criada com sucesso',
        data: { id: result.lastID }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Meta criada com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao criar meta:', error);
    
    if (error.message.includes('Já existe uma meta')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao criar meta' },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}