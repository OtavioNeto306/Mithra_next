import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/mysql'

export async function GET() {
  try {
    // Buscar lista de técnicos únicos
    const query = `
      SELECT DISTINCT TECNICO as id, TECNICO as nome 
      FROM PROSPECT 
      WHERE TECNICO IS NOT NULL AND TECNICO != '' 
      ORDER BY TECNICO
    `
    
    console.log('Query técnicos:', query)
    
    const tecnicos = await executeQuery(query)
    
    return NextResponse.json({
      success: true,
      tecnicos: tecnicos || []
    })
    
  } catch (error) {
    console.error('Erro ao buscar técnicos:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}