import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/mysql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filtros opcionais
    const cliente = searchParams.get('cliente') || '';
    const tecnico = searchParams.get('tecnico') || '';
    const dataInicio = searchParams.get('dataInicio') || '';
    const dataFim = searchParams.get('dataFim') || '';

    console.log('Buscando dados de checkin com filtros:', {
      page, limit, cliente, tecnico, dataInicio, dataFim
    });

    // Construir query com filtros
    let whereClause = '';
    const params: any[] = [];

    if (cliente) {
      whereClause += ' AND (CLIENTE LIKE ? OR NOME LIKE ?)';
      params.push(`%${cliente}%`, `%${cliente}%`);
    }

    if (tecnico) {
      whereClause += ' AND TECNICO LIKE ?';
      params.push(`%${tecnico}%`);
    }

    if (dataInicio) {
      whereClause += ' AND DATA >= ?';
      params.push(dataInicio.replace(/-/g, ''));
    }

    if (dataFim) {
      whereClause += ' AND DATA <= ?';
      params.push(dataFim.replace(/-/g, ''));
    }

    // Query principal - ajustar nome da tabela conforme necessário
    const query = `
      SELECT 
        CHAVE,
        DATA,
        HORA,
        CLIENTE,
        NOME,
        TELEFONE,
        CIDADE,
        LATITUDE,
        LONGITUDE,
        TECNICO
      FROM checkin 
      WHERE 1=1 ${whereClause}
      ORDER BY DATA DESC, HORA DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const checkinData = await executeQuery(query, params);

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM checkin 
      WHERE 1=1 ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit e offset
    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Formatear os dados
    const formatatedData = checkinData.map((item: any) => ({
      ...item,
      DATA_FORMATADA: formatarData(item.DATA),
      HORA_FORMATADA: formatarHora(item.HORA)
    }));

    return NextResponse.json({
      data: formatatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        cliente,
        tecnico,
        dataInicio,
        dataFim
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados de checkin:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar dados de checkin',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Função auxiliar para formatear data
function formatarData(data: string): string {
  if (!data || data.length !== 8) return data;
  
  const ano = data.substring(0, 4);
  const mes = data.substring(4, 6);
  const dia = data.substring(6, 8);
  
  return `${dia}/${mes}/${ano}`;
}

// Função auxiliar para formatear hora
function formatarHora(hora: string): string {
  if (!hora || hora.length < 4) return hora;
  
  const horas = hora.substring(0, 2);
  const minutos = hora.substring(2, 4);
  const segundos = hora.length >= 6 ? hora.substring(4, 6) : '00';
  
  return `${horas}:${minutos}:${segundos}`;
} 