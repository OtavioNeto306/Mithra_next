import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const tecnico = searchParams.get('tecnico')

    // Construir query base
    let query = `
      SELECT 
        CGC,
        DATA,
        HORA,
        LATITUDE,
        LONGITUDE,
        NOME,
        DTNASC,
        INSCRI,
        TELEFONE,
        CIDADE,
        ESTADO,
        SEGMENTO,
        EMAIL,
        ANIMAL,
        TECNICO
      FROM PROSPECT
      WHERE 1=1
    `
    
    const params: any[] = []
    
    // Aplicar filtros
    if (search) {
      query += ` AND (
        NOME LIKE ? OR 
        CGC LIKE ? OR 
        EMAIL LIKE ? OR
        TELEFONE LIKE ? OR
        CIDADE LIKE ?
      )`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
    }
    
    if (dataInicio) {
      // Converter data do formato YYYY-MM-DD para YYYYMMDD
      const dataInicioFormatted = dataInicio.replace(/-/g, '')
      query += ` AND DATA >= ?`
      params.push(dataInicioFormatted)
    }
    
    if (dataFim) {
      // Converter data do formato YYYY-MM-DD para YYYYMMDD
      const dataFimFormatted = dataFim.replace(/-/g, '')
      query += ` AND DATA <= ?`
      params.push(dataFimFormatted)
    }
    
    if (tecnico) {
      query += ` AND TECNICO = ?`
      params.push(tecnico)
    }
    
    // Ordenar por data e hora mais recentes
    query += ` ORDER BY DATA DESC, HORA DESC LIMIT 1000`
    
    console.log('Query prospects:', query)
    console.log('Params:', params)
    
    // Executar query principal
    const prospects = await executeQuery(query, params)
    
    // Buscar lista de técnicos únicos para o filtro
    const tecnicosQuery = `
      SELECT DISTINCT TECNICO as id, TECNICO as nome 
      FROM PROSPECT 
      WHERE TECNICO IS NOT NULL AND TECNICO != '' 
      ORDER BY TECNICO
    `
    
    const tecnicos = await executeQuery(tecnicosQuery)
    
    return NextResponse.json({
      success: true,
      prospects: prospects || [],
      tecnicos: tecnicos || [],
      total: prospects?.length || 0
    })
    
  } catch (error) {
    console.error('Erro ao buscar prospects:', error)
    
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