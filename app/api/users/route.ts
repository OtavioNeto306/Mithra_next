/**
 * API de Gerenciamento de Usuários
 * 
 * Esta API fornece endpoints para:
 * - Listar todos os usuários
 * - Buscar usuário específico
 * - Atualizar comissão e senha de usuários
 * 
 * A API integra dados do Oracle (informações básicas) com SQLite (dados de autenticação)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByCode, updateUserCommission, getAllUsers, openDb } from '@/lib/db';
import { executeQuery } from '@/lib/db/odbc';
import bcrypt from 'bcryptjs';

/**
 * GET /api/users
 * 
 * Lista todos os usuários ou busca um usuário específico por código
 * 
 * Query Parameters:
 * - codigo (opcional): Código do usuário para busca específica
 * 
 * Retorna:
 * - 200: Lista de usuários ou usuário específico
 * - 404: Usuário não encontrado (quando busca específica)
 * - 500: Erro interno do servidor
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const codigo = searchParams.get('codigo');

  try {
    // Busca dados básicos dos usuários no Oracle
    const oracleUsers = await executeQuery(`
      SELECT P.CODI_PES, P.NOME_PES
      FROM PESSOAL P 
      INNER JOIN VENDEDOR V ON P.CODI_PES = V.CODI_PES 
      WHERE P.SITU_PES = 'A'
    `);
    
    // Busca dados de autenticação no SQLite
    const sqliteUsers = await getAllUsers();
    
    // Cria um mapa para acesso eficiente aos dados do SQLite
    const sqliteUserMap = new Map(sqliteUsers.map(user => [user.USUARIO, user]));
    
    // Combina dados do Oracle e SQLite
    const combinedUsers = oracleUsers.map((oracleUser: any) => {
      const sqliteUser = sqliteUserMap.get(oracleUser.CODI_PES.toString());
      return {
        USUARIO: oracleUser.CODI_PES.toString(),
        NOME: oracleUser.NOME_PES,
        COMISSAO: sqliteUser?.COMISSAO || '0.00',
        PASSWORD: sqliteUser?.PASSWORD || '',
        USERNAME: sqliteUser?.USERNAME || '',
        UACESSO: sqliteUser?.UACESSO || '',
        BLOQUEADO: sqliteUser?.BLOQUEADO || 0,
        existsInSqlite: !!sqliteUser
      };
    });

    // Retorna usuário específico se código for fornecido
    if (codigo) {
      const user = combinedUsers.find(u => u.USUARIO === codigo);
      if (!user) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    return NextResponse.json(combinedUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

/**
 * PATCH /api/users
 * 
 * Atualiza comissão e/ou senha de um usuário específico
 * 
 * Query Parameters:
 * - codigo (obrigatório): Código do usuário a ser atualizado
 * 
 * Body:
 * - comissao (opcional): Nova comissão do usuário
 * - password (opcional): Nova senha do usuário
 * - nome (opcional): Nome do usuário (usado apenas na criação)
 * 
 * Retorna:
 * - 200: Dados atualizados com sucesso
 * - 400: Dados inválidos ou faltando
 * - 500: Erro interno do servidor
 */
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
    const { comissao, password, nome } = await request.json();

    // Valida se pelo menos um campo para atualização foi fornecido
    if (!comissao && !password) {
      return NextResponse.json(
        { error: 'Informe comissão ou senha para atualizar' },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe no SQLite
    const existingUser = await getUserByCode(codigo);
    
    // Se não existir, cria novo usuário no SQLite
    if (!existingUser) {
      const db = await openDb();
      const hash = password ? await bcrypt.hash(password, 12) : '';
      await db.run(
        'INSERT INTO USERCC (USUARIO, NOME, COMISSAO, PASSWORD) VALUES (?, ?, ?, ?)',
        [codigo, nome, comissao || '0.00', hash]
      );
      await db.close();
      return NextResponse.json({ message: 'Usuário criado com sucesso' });
    }

    // Atualiza usuário existente
    let success = true;
    
    // Atualiza comissão se fornecida
    if (comissao) {
      const result = await updateUserCommission(codigo, comissao);
      if (!result) success = false;
    }
    
    // Atualiza senha se fornecida
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
    console.error('Erro ao atualizar dados:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados' }, { status: 500 });
  }
} 