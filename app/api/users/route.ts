import { NextRequest, NextResponse } from 'next/server';
import { getUserByCode, updateUserCommission, getAllUsers } from '@/lib/db';

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

// PATCH /api/users - Atualiza comissão do usuário
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
    const { comissao } = await request.json();

    if (!comissao) {
      return NextResponse.json(
        { error: 'Comissão é obrigatória' },
        { status: 400 }
      );
    }

    const success = await updateUserCommission(codigo, comissao);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao atualizar comissão' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Comissão atualizada com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar comissão' }, { status: 500 });
  }
} 