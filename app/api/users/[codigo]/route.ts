import { NextRequest, NextResponse } from 'next/server';
import { getUserByCode, updateUserCommission } from '@/lib/db';

// Defina a interface explicitamente
interface RouteContext {
  params: {
    codigo: string;
  };
}

// GET /api/users/[codigo]
export async function GET(request: NextRequest, context: RouteContext) { // Use a interface aqui
  try {
    const { codigo } = context.params; // Desestruture aqui
    const user = await getUserByCode(codigo); // Use 'codigo'
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
  }
}

// PATCH /api/users/[codigo]
export async function PATCH(request: NextRequest, context: RouteContext) { // Use a interface aqui
  try {
    const { codigo } = context.params; // Desestruture aqui
    const { comissao } = await request.json();

    if (!comissao) {
      return NextResponse.json(
        { error: 'Comissão é obrigatória' },
        { status: 400 }
      );
    }

    const success = await updateUserCommission(codigo, comissao); // Use 'codigo'
    if (!success) {
      return NextResponse.json({ error: 'Erro ao atualizar comissão' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Comissão atualizada com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar comissão' }, { status: 500 });
  }
}