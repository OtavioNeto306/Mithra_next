import { NextRequest, NextResponse } from 'next/server';
import { getUserByCode, updateUserCommission } from '@/lib/db';

// GET /api/users/[codigo] - Busca usuário por código
export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const user = await getUserByCode(params.codigo);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// PATCH /api/users/[codigo] - Atualiza comissão do usuário
export async function PATCH(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const { comissao } = await request.json();

    if (!comissao) {
      return NextResponse.json(
        { error: 'Comissão é obrigatória' },
        { status: 400 }
      );
    }

    const success = await updateUserCommission(params.codigo, comissao);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao atualizar comissão' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Comissão atualizada com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar comissão' }, { status: 500 });
  }
} 