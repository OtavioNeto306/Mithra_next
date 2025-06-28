import { NextResponse } from 'next/server'
import { openDb } from '@/lib/db'

// Interface para as configurações
interface Configuracoes {
  obrigarLocalizacao: boolean
  alterarPreco: string
  tempoLimite: number
}

// GET /api/configuracoes
export async function GET() {
  try {
    const db = await openDb()
    const configuracoes = await db.get('SELECT * FROM configuracoes WHERE id = 1')
    
    if (!configuracoes) {
      // Se não existir, retorna configurações padrão
      return NextResponse.json({
        obrigarLocalizacao: false,
        alterarPreco: 'nao',
        tempoLimite: 30
      })
    }

    return NextResponse.json(configuracoes)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// POST /api/configuracoes
export async function POST(request: Request) {
  try {
    const configuracoes: Configuracoes = await request.json()
    const db = await openDb()

    // Verifica se já existe configuração
    const existe = await db.get('SELECT id FROM configuracoes WHERE id = 1')

    if (existe) {
      // Atualiza configuração existente
      await db.run(
        'UPDATE configuracoes SET obrigarLocalizacao = ?, alterarPreco = ?, tempoLimite = ? WHERE id = 1',
        [configuracoes.obrigarLocalizacao, configuracoes.alterarPreco, configuracoes.tempoLimite]
      )
    } else {
      // Insere nova configuração
      await db.run(
        'INSERT INTO configuracoes (id, obrigarLocalizacao, alterarPreco, tempoLimite) VALUES (1, ?, ?, ?)',
        [configuracoes.obrigarLocalizacao, configuracoes.alterarPreco, configuracoes.tempoLimite]
      )
    }

    return NextResponse.json({ message: 'Configurações salvas com sucesso' })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
} 