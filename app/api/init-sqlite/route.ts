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
          marca TEXT,
          modelo TEXT,
          peso DECIMAL(10,3),
          dimensoes TEXT,
          cor TEXT,
          material TEXT,
          caracteristicas TEXT,
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

    await db.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Tabela produto_imagens criada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tabela' },
      { status: 500 }
    );
  }
} 