import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function POST(request: NextRequest) {
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

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB permitido' },
        { status: 400 }
      );
    }

    // Obter extensão do arquivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Criar nome do arquivo com o código do produto
    const fileName = `${codi_psv.trim()}.${fileExtension}`;
    
    // Caminho onde salvar o arquivo
    const uploadDir = join(process.cwd(), 'public', 'img');
    const filePath = join(uploadDir, fileName);

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // URL da imagem para salvar no banco
    const imageUrl = `/img/${fileName}`;

    // Salvar no banco de dados SQLite
    const db = await open({
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

    await db.close();

    return NextResponse.json({ 
      success: true, 
      url_imagem: imageUrl,
      message: 'Imagem salva com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 