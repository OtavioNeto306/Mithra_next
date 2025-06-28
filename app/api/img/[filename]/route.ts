import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    
    // Validação básica do nome do arquivo para segurança
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Nome de arquivo inválido', { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', 'img', filename);

    if (!existsSync(filePath)) {
      return new NextResponse('Imagem não encontrada', { status: 404 });
    }

    // Obter informações do arquivo para usar na geração do ETag
    const fileStats = await stat(filePath);
    const fileBuffer = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Gerar ETag baseado no filename e timestamp de modificação
    const etag = `"${filename}-${fileStats.mtime.getTime()}"`;
    
    // Verificar se o cliente já tem a versão atual (If-None-Match)
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }
    
    // Determinar o Content-Type baseado na extensão
    let contentType = 'image/jpeg';
    switch (ext) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        contentType = 'image/jpeg';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // Cache menor para permitir atualizações mais rápidas
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'ETag': etag,
        'Last-Modified': fileStats.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
} 