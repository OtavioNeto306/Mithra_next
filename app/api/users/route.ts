import { NextRequest, NextResponse } from 'next/server';
import { getUserByCode, updateUserCommission, getAllUsers, openDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/users - Lista todos os usuários ou busca um usuário específico
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const codigo = searchParams.get('codigo');

  // Se não houver código, retorna todos os usuários
  if (!codigo) {
    try {
      const users = await getAllUsers();
      return NextResponse.json(users);
    } catch (error) {
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }
  }

  // Se houver código, busca o usuário específico
  try {
    const user = await getUserByCode(codigo);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// PATCH /api/users - Atualiza comissão e senha do usuário
export async function PATCH(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const codigo = searchParams.get('codigo');

  if (!codigo) {
    return NextResponse.json(
      { error: 'Código do usuário é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const { comissao, password } = await request.json();

    if (!comissao && !password) {
      return NextResponse.json(
        { error: 'Informe comissão ou senha para atualizar' },
        { status: 400 }
      );
    }

    // Atualizar comissão se enviada
    let success = true;
    if (comissao) {
      const result = await updateUserCommission(codigo, comissao);
      if (!result) success = false;
    }
    // Atualizar senha se enviada
    if (password) {
      const db = await openDb();
      const hash = await bcrypt.hash(password, 12);
      await db.run('UPDATE USERCC SET PASSWORD = ? WHERE USUARIO = ?', [hash, codigo]);
      await db.close();
    }
    if (!success) {
      return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Dados atualizados com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
  }
} 