import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function POST() {
  try {
    const db = await open({
      filename: 'usuarios.db3',
      driver: sqlite3.Database
    });

    // Criar tabela produto_imagens se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS produto_imagens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codi_psv TEXT NOT NULL,
          url_imagem TEXT NOT NULL,
          data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(codi_psv)
      );
    `);

    // Criar índice para melhorar performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_produto_imagens_codi_psv ON produto_imagens(codi_psv);
    `);

    // Criar tabela produto_ficha_tecnica se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS produto_ficha_tecnica (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codi_psv TEXT NOT NULL,
          especificacoes_tecnicas TEXT,
          observacoes TEXT,
          data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(codi_psv)
      );
    `);

    // Criar índice para ficha técnica
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_produto_ficha_tecnica_codi_psv ON produto_ficha_tecnica(codi_psv);
    `);

    // Criar trigger para atualizar data_atualizacao
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_ficha_tecnica_timestamp 
          AFTER UPDATE ON produto_ficha_tecnica
          FOR EACH ROW
      BEGIN
          UPDATE produto_ficha_tecnica 
          SET data_atualizacao = CURRENT_TIMESTAMP 
          WHERE id = NEW.id;
      END;
    `);

    // Criar tabela metas_vendedores se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS metas_vendedores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigo_vendedor TEXT NOT NULL,
          ano INTEGER NOT NULL,
          mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
          tipo_meta TEXT NOT NULL CHECK (tipo_meta IN ('fornecedor', 'produto')),
          codigo_fornecedor TEXT,
          codigo_produto TEXT,
          valor_meta DECIMAL(15,2) NOT NULL,
          observacoes TEXT,
          data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(codigo_vendedor, ano, mes, tipo_meta, COALESCE(codigo_fornecedor, ''), COALESCE(codigo_produto, ''))
      );
    `);

    // Criar índices para metas_vendedores
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metas_vendedores_codigo_vendedor ON metas_vendedores(codigo_vendedor);
    `);
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metas_vendedores_ano_mes ON metas_vendedores(ano, mes);
    `);
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metas_vendedores_tipo_meta ON metas_vendedores(tipo_meta);
    `);
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metas_vendedores_fornecedor ON metas_vendedores(codigo_fornecedor);
    `);
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metas_vendedores_produto ON metas_vendedores(codigo_produto);
    `);

    // Criar trigger para atualizar data_atualizacao das metas
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_metas_vendedores_timestamp 
          AFTER UPDATE ON metas_vendedores
          FOR EACH ROW
      BEGIN
          UPDATE metas_vendedores 
          SET data_atualizacao = CURRENT_TIMESTAMP 
          WHERE id = NEW.id;
      END;
    `);

    await db.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Tabelas criadas com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tabela' },
      { status: 500 }
    );
  }
} 