import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario, senha } = body

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const db = await openDb()
    
    // Buscar usuário na tabela user_permissions
    const user = await db.get(`
      SELECT 
        id, usuario, nome, email, senha, ativo,
        permissao_checkin, permissao_rotas, permissao_dashboard,
        permissao_metas, permissao_pedidos, permissao_produtos,
        permissao_prospects, permissao_propostas, permissao_vendedores, permissao_configuracoes, permissao_gerencia
      FROM user_permissions 
      WHERE usuario = ?
    `, [usuario])
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    if (!user.ativo) {
      return NextResponse.json(
        { error: 'Usuário inativo' },
        { status: 401 }
      )
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha)
    
    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Remover senha do retorno
    const { senha: _, ...userSemSenha } = user

    // Criar objeto de permissões
    const permissoes = {
      checkin: user.permissao_checkin === 1,
      rotas: user.permissao_rotas === 1,
      dashboard: user.permissao_dashboard === 1,
      metas: user.permissao_metas === 1,
      pedidos: user.permissao_pedidos === 1,
      produtos: user.permissao_produtos === 1,
      prospects: user.permissao_prospects === 1,
      propostas: user.permissao_propostas === 1,
      vendedores: user.permissao_vendedores === 1,
      configuracoes: user.permissao_configuracoes === 1,
      gerencia: user.permissao_gerencia === 1
    }

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        usuario: user.usuario,
        nome: user.nome,
        email: user.email,
        permissoes
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}