import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ImageProcessor } from '@/lib/image-processor';

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

export async function POST(request: NextRequest) {
  let db: any = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const codi_psv = formData.get('codi_psv') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    if (!codi_psv) {
      return NextResponse.json(
        { error: 'Código do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (máximo 10MB para upload, será otimizado depois)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB permitido para upload' },
        { status: 400 }
      );
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`📤 Upload recebido: ${file.name}, ${Math.round(file.size / 1024)}KB`);

    // Obter extensão do arquivo original
    const originalExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Criar nome do arquivo com o código do produto
    const fileName = `${codi_psv.trim()}.${originalExtension}`;
    
    // Caminho onde salvar o arquivo
    const uploadDir = join(process.cwd(), 'public', 'img');
    const filePath = join(uploadDir, fileName);

    try {
      // Processar a imagem (redimensionar e comprimir)
      console.log(`🔄 Iniciando processamento da imagem...`);
      
      const processingResult = await ImageProcessor.processImage(buffer, filePath, {
        maxWidth: 600,
        maxHeight: 600,
        maxSizeKB: 500,
        quality: 85
      });

      console.log(`✅ Imagem processada com sucesso:`);
      console.log(`   📏 Dimensões: ${processingResult.originalDimensions.width}x${processingResult.originalDimensions.height} → ${processingResult.finalDimensions.width}x${processingResult.finalDimensions.height}`);
      console.log(`   📦 Tamanho: ${Math.round(processingResult.originalSize / 1024)}KB → ${Math.round(processingResult.finalSize / 1024)}KB`);
      console.log(`   🔄 Redimensionada: ${processingResult.wasResized ? 'Sim' : 'Não'}`);
      console.log(`   🗜️ Comprimida: ${processingResult.wasCompressed ? 'Sim' : 'Não'}`);

      // Usar o caminho final (pode ter mudado se convertido para WebP)
      const finalFileName = processingResult.filePath.split(/[/\\]/).pop() || fileName;
      const imageUrl = `/api/img/${finalFileName}`;

      // Salvar no banco de dados SQLite com retry
      await executeSQLiteWithRetry(async () => {
        db = await open({
          filename: 'usuarios.db3',
          driver: sqlite3.Database
        });

        // Verificar se já existe uma imagem para este produto
        const imagemExistente = await db.get(
          'SELECT id FROM produto_imagens WHERE codi_psv = ?',
          [codi_psv.trim()]
        );

        if (imagemExistente) {
          // Atualizar imagem existente
          await db.run(
            'UPDATE produto_imagens SET url_imagem = ?, data_cadastro = CURRENT_TIMESTAMP WHERE codi_psv = ?',
            [imageUrl, codi_psv.trim()]
          );
        } else {
          // Inserir nova imagem
          await db.run(
            'INSERT INTO produto_imagens (codi_psv, url_imagem) VALUES (?, ?)',
            [codi_psv.trim(), imageUrl]
          );
        }

        console.log(`💾 Imagem salva no banco: ${imageUrl}`);
      });

      return NextResponse.json({ 
        success: true, 
        url_imagem: imageUrl,
        message: 'Imagem processada e salva com sucesso',
        processing_info: {
          original_size_kb: Math.round(processingResult.originalSize / 1024),
          final_size_kb: Math.round(processingResult.finalSize / 1024),
          original_dimensions: processingResult.originalDimensions,
          final_dimensions: processingResult.finalDimensions,
          was_resized: processingResult.wasResized,
          was_compressed: processingResult.wasCompressed,
          compression_ratio: Math.round((1 - processingResult.finalSize / processingResult.originalSize) * 100)
        }
      });

    } catch (processingError) {
      console.error('❌ Erro no processamento da imagem:', processingError);
      
      // Fallback: salvar imagem original se o processamento falhar
      console.log('⚠️ Salvando imagem original como fallback...');
      await writeFile(filePath, buffer);
      
      const imageUrl = `/api/img/${fileName}`;

      // Salvar no banco mesmo com fallback, usando retry
      await executeSQLiteWithRetry(async () => {
        if (!db) {
          db = await open({
            filename: 'usuarios.db3',
            driver: sqlite3.Database
          });
        }

        const imagemExistente = await db.get(
          'SELECT id FROM produto_imagens WHERE codi_psv = ?',
          [codi_psv.trim()]
        );

        if (imagemExistente) {
          await db.run(
            'UPDATE produto_imagens SET url_imagem = ?, data_cadastro = CURRENT_TIMESTAMP WHERE codi_psv = ?',
            [imageUrl, codi_psv.trim()]
          );
        } else {
          await db.run(
            'INSERT INTO produto_imagens (codi_psv, url_imagem) VALUES (?, ?)',
            [codi_psv.trim(), imageUrl]
          );
        }

        console.log(`💾 Imagem salva no banco (fallback): ${imageUrl}`);
      });

      return NextResponse.json({ 
        success: true, 
        url_imagem: imageUrl,
        message: 'Imagem salva (processamento falhou, usando original)',
        warning: 'A imagem não pôde ser otimizada automaticamente'
      });
    }

  } catch (error) {
    console.error('❌ Erro geral no upload da imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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