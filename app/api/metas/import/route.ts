import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { MetaCreate } from '@/types/metas';

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

// Função para validar dados de meta
function validateMeta(meta: MetaCreate, lineNumber: number): string[] {
  const errors: string[] = [];
  const prefix = `Linha ${lineNumber}:`;

  if (!meta.codigo_vendedor) {
    errors.push(`${prefix} Código do vendedor é obrigatório`);
  }

  if (!meta.ano || meta.ano < 2020 || meta.ano > 2030) {
    errors.push(`${prefix} Ano deve estar entre 2020 e 2030`);
  }

  if (!meta.mes || meta.mes < 1 || meta.mes > 12) {
    errors.push(`${prefix} Mês deve estar entre 1 e 12`);
  }

  if (!meta.tipo_meta || !['fornecedor', 'produto'].includes(meta.tipo_meta)) {
    errors.push(`${prefix} Tipo de meta deve ser "fornecedor" ou "produto"`);
  }

  if ((!meta.valor_meta || meta.valor_meta <= 0) && (!meta.quantidade_meta || meta.quantidade_meta <= 0)) {
    errors.push(`${prefix} Pelo menos um tipo de meta (valor ou quantidade) deve ser preenchido`);
  }

  if (meta.tipo_meta === 'fornecedor' && !meta.codigo_fornecedor) {
    errors.push(`${prefix} Código do fornecedor é obrigatório para meta por fornecedor`);
  }

  if (meta.tipo_meta === 'produto' && !meta.codigo_produto) {
    errors.push(`${prefix} Código do produto é obrigatório para meta por produto`);
  }

  return errors;
}

// Função para processar arquivo CSV
function parseCSV(text: string): MetaCreate[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const data: MetaCreate[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      throw new Error(`Linha ${i + 1}: Número de colunas não confere com o cabeçalho`);
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });

    // Converter tipos
    const meta: MetaCreate = {
      codigo_vendedor: row.codigo_vendedor,
      ano: row.ano ? parseInt(row.ano) : undefined,
      mes: row.mes ? parseInt(row.mes) : undefined,
      tipo_meta: row.tipo_meta as 'fornecedor' | 'produto',
      codigo_fornecedor: row.codigo_fornecedor || undefined,
      codigo_produto: row.codigo_produto || undefined,
      valor_meta: row.valor_meta ? parseFloat(row.valor_meta) : undefined,
      quantidade_meta: row.quantidade_meta ? parseFloat(row.quantidade_meta) : undefined,
      observacoes: row.observacoes || undefined
    };

    data.push(meta);
  }

  return data;
}

// POST - Importar metas via arquivo
export async function POST(request: Request) {
  let db: any = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Apenas arquivos CSV e Excel são aceitos' },
        { status: 400 }
      );
    }

    // Ler conteúdo do arquivo
    const text = await file.text();
    let parsedData: MetaCreate[];

    try {
      parsedData = parseCSV(text);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: `Erro ao processar arquivo: ${error.message}` },
        { status: 400 }
      );
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Arquivo não contém dados válidos' },
        { status: 400 }
      );
    }

    // Validar todos os dados antes de inserir
    const allErrors: string[] = [];
    const validMetas: MetaCreate[] = [];

    parsedData.forEach((meta, index) => {
      const errors = validateMeta(meta, index + 2); // +2 porque linha 1 é cabeçalho
      if (errors.length > 0) {
        allErrors.push(...errors);
      } else {
        validMetas.push(meta);
      }
    });

    // Se há muitos erros, retornar apenas os primeiros
    if (allErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos encontrados',
        total: parsedData.length,
        imported: 0,
        errors: allErrors.slice(0, 50) // Limitar a 50 erros para não sobrecarregar
      }, { status: 400 });
    }

    // Inserir dados válidos
    let importedCount = 0;
    const importErrors: string[] = [];

    await executeSQLiteWithRetry(async () => {
      db = await openDb();

      // Usar transação para garantir consistência
      await db.run('BEGIN TRANSACTION');

      try {
        for (let i = 0; i < validMetas.length; i++) {
          const meta = validMetas[i];
          const lineNumber = i + 2;

          try {
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
              importErrors.push(`Linha ${lineNumber}: Meta já existe para este vendedor, período e tipo`);
              continue;
            }

            // Inserir nova meta
            await db.run(
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

            importedCount++;
          } catch (error: any) {
            importErrors.push(`Linha ${lineNumber}: Erro ao inserir - ${error.message}`);
          }
        }

        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    });

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${importedCount} de ${parsedData.length} metas importadas`,
      total: parsedData.length,
      imported: importedCount,
      errors: importErrors
    });

  } catch (error: any) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro interno do servidor',
        total: 0,
        imported: 0,
        errors: [error.message || 'Erro desconhecido']
      },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}