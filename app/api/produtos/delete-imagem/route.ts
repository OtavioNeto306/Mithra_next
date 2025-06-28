import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
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

export async function DELETE(request: NextRequest) {
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

    console.log(`🗑️ Iniciando deleção de imagem para produto: ${codi_psv}`);

    let imagemExistente: any = null;
    let fileName: string = '';
    let arquivoDeletado = false;

    // Executar operação com retry
    await executeSQLiteWithRetry(async () => {
      db = await open({
        filename: 'usuarios.db3',
        driver: sqlite3.Database
      });

      // Buscar a imagem no banco
      imagemExistente = await db.get(
        'SELECT id, url_imagem FROM produto_imagens WHERE codi_psv = ?',
        [codi_psv.trim()]
      );

      if (!imagemExistente) {
        throw new Error('Nenhuma imagem encontrada para este produto');
      }

      // Extrair nome do arquivo da URL
      const urlImagem = imagemExistente.url_imagem;
      fileName = urlImagem.replace('/api/img/', '');
      const filePath = join(process.cwd(), 'public', 'img', fileName);

      console.log(`📁 Arquivo a ser deletado: ${filePath}`);

      // Tentar deletar o arquivo físico
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
          arquivoDeletado = true;
          console.log(`✅ Arquivo físico deletado: ${fileName}`);
        } catch (fileError) {
          console.error(`⚠️ Erro ao deletar arquivo físico: ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}`);
          // Continua mesmo se não conseguir deletar o arquivo
        }
      } else {
        console.log(`⚠️ Arquivo físico não encontrado: ${fileName}`);
      }

      // Remover registro do banco de dados
      await db.run(
        'DELETE FROM produto_imagens WHERE codi_psv = ?',
        [codi_psv.trim()]
      );

      console.log(`✅ Registro removido do banco de dados para produto: ${codi_psv}`);
    });

    if (!imagemExistente) {
      return NextResponse.json(
        { error: 'Nenhuma imagem encontrada para este produto' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Imagem deletada com sucesso',
      details: {
        arquivo_deletado: arquivoDeletado,
        arquivo_nome: fileName,
        produto: codi_psv.trim()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar imagem:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor ao deletar imagem' },
      { status: 500 }
    );
  } finally {
    // Garantir que a conexão seja sempre fechada
    if (db) {
      try {
        await db.close();
        console.log('🔒 Conexão SQLite fechada');
      } catch (closeError) {
        console.error('⚠️ Erro ao fechar conexão SQLite:', closeError);
      }
    }
  }
} 