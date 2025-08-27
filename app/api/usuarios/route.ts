import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const db = await openDb()
    const usuarios = await db.all(`
      SELECT 
        id, usuario, nome, email, ativo,
        permissao_checkin, permissao_rotas, permissao_dashboard,
        permissao_metas, permissao_pedidos, permissao_produtos,
        permissao_prospects, permissao_propostas, permissao_vendedores, permissao_configuracoes, permissao_gerencia,
        created_at, updated_at
      FROM user_permissions 
      ORDER BY nome
    `)
    
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      usuario,
      nome,
      email,
      senha,
      ativo = 1,
      permissao_checkin = 0,
      permissao_rotas = 0,
      permissao_dashboard = 0,
      permissao_metas = 0,
      permissao_pedidos = 0,
      permissao_produtos = 0,
      permissao_prospects = 0,
       permissao_propostas = 0,
       permissao_vendedores = 0,
      permissao_configuracoes = 0,
      permissao_gerencia = 0
    } = body

    if (!usuario || !nome || !senha) {
      return NextResponse.json(
        { error: 'Usuário, nome e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const db = await openDb()
    
    // Verificar se o usuário já existe
    const existingUser = await db.get(
      'SELECT id FROM user_permissions WHERE usuario = ?',
      [usuario]
    )
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10)

    // Inserir novo usuário
    const result = await db.run(`
      INSERT INTO user_permissions (
        usuario, nome, email, senha, ativo,
        permissao_checkin, permissao_rotas, permissao_dashboard,
        permissao_metas, permissao_pedidos, permissao_produtos,
        permissao_prospects, permissao_propostas, permissao_vendedores, permissao_configuracoes, permissao_gerencia
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      usuario, nome, email, hashedPassword, ativo,
      permissao_checkin, permissao_rotas, permissao_dashboard,
      permissao_metas, permissao_pedidos, permissao_produtos,
      permissao_prospects, permissao_propostas, permissao_vendedores, permissao_configuracoes, permissao_gerencia
    ])

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', id: result.lastID },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      usuario,
      nome,
      email,
      senha,
      ativo,
      permissao_checkin,
      permissao_rotas,
      permissao_dashboard,
      permissao_metas,
      permissao_pedidos,
      permissao_produtos,
      permissao_prospects,
      permissao_propostas,
      permissao_vendedores,
      permissao_configuracoes,
      permissao_gerencia
    } = body

    if (!id || !usuario || !nome) {
      return NextResponse.json(
        { error: 'ID, usuário e nome são obrigatórios' },
        { status: 400 }
      )
    }

    const db = await openDb()
    
    let updateQuery = `
      UPDATE user_permissions SET 
        usuario = ?, nome = ?, email = ?, ativo = ?,
        permissao_checkin = ?, permissao_rotas = ?, permissao_dashboard = ?,
        permissao_metas = ?, permissao_pedidos = ?, permissao_produtos = ?,
        permissao_prospects = ?, permissao_propostas = ?, permissao_vendedores = ?, permissao_configuracoes = ?, permissao_gerencia = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    
    let params = [
      usuario, nome, email, ativo,
      permissao_checkin, permissao_rotas, permissao_dashboard,
      permissao_metas, permissao_pedidos, permissao_produtos,
      permissao_prospects, permissao_propostas, permissao_vendedores, permissao_configuracoes, permissao_gerencia,
      id
    ]

    // Se uma nova senha foi fornecida, incluir no update
    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, 10)
      updateQuery = `
        UPDATE user_permissions SET 
          usuario = ?, nome = ?, email = ?, senha = ?, ativo = ?,
          permissao_checkin = ?, permissao_rotas = ?, permissao_dashboard = ?,
          permissao_metas = ?, permissao_pedidos = ?, permissao_produtos = ?,
          permissao_prospects = ?, permissao_propostas = ?, permissao_vendedores = ?, permissao_configuracoes = ?, permissao_gerencia = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      params = [
        usuario, nome, email, hashedPassword, ativo,
        permissao_checkin, permissao_rotas, permissao_dashboard,
        permissao_metas, permissao_pedidos, permissao_produtos,
        permissao_prospects, permissao_propostas, permissao_vendedores, permissao_configuracoes, permissao_gerencia,
        id
      ]
    }

    await db.run(updateQuery, params)

    return NextResponse.json({ message: 'Usuário atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const db = await openDb()
    await db.run('DELETE FROM user_permissions WHERE id = ?', [id])

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}