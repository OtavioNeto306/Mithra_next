import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/mysql';

interface CheckinMapaData {
  CHAVE: number;
  DATA_ISO: string;
  HORA: string;
  CLIENTE: string;
  NOME: string;
  CIDADE: string;
  LAT: number;
  LNG: number;
  TECNICO: string;
  ordem_sequencial: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tecnico = searchParams.get('tecnico');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const cliente = searchParams.get('cliente');

    // Query otimizada para dados do mapa
    let query = `
      SELECT 
        CHAVE,
        CONCAT(SUBSTRING(DATA, 1, 4), '-', SUBSTRING(DATA, 5, 2), '-', SUBSTRING(DATA, 7, 2)) as DATA_ISO,
        HORA,
        CLIENTE,
        NOME,
        CIDADE,
        CAST(LATITUDE AS DECIMAL(10,8)) as LAT,
        CAST(LONGITUDE AS DECIMAL(11,8)) as LNG,
        TECNICO,
        ROW_NUMBER() OVER (PARTITION BY TECNICO, DATA ORDER BY HORA) as ordem_sequencial
      FROM checkin 
      WHERE LATITUDE != '' 
        AND LONGITUDE != '' 
        AND LATITUDE != '0' 
        AND LONGITUDE != '0'
    `;

    const params: any[] = [];

    // Filtros opcionais
    if (tecnico) {
      query += ' AND TECNICO = ?';
      params.push(tecnico);
    }

    if (dataInicio) {
      // Converter formato YYYY-MM-DD para YYYYMMDD
      const dataInicioFormatada = dataInicio.replace(/-/g, '');
      query += ' AND DATA >= ?';
      params.push(dataInicioFormatada);
    }

    if (dataFim) {
      // Converter formato YYYY-MM-DD para YYYYMMDD
      const dataFimFormatada = dataFim.replace(/-/g, '');
      query += ' AND DATA <= ?';
      params.push(dataFimFormatada);
    }

    if (cliente) {
      query += ' AND CLIENTE LIKE ?';
      params.push(`%${cliente}%`);
    }

    query += ' ORDER BY DATA, HORA';

    const rawResult = await executeQuery(query, params) as any[];

    // Converter coordenadas para números
    const result: CheckinMapaData[] = rawResult.map(row => ({
      ...row,
      LAT: parseFloat(row.LAT),
      LNG: parseFloat(row.LNG)
    }));

    // console.log('API: dados processados', result.length, 'registros');

    // Agrupar por técnico para facilitar a criação de trajetórias
    const trajetoriasPorTecnico = result.reduce((acc, checkin) => {
      if (!acc[checkin.TECNICO]) {
        acc[checkin.TECNICO] = [];
      }
      acc[checkin.TECNICO].push(checkin);
      return acc;
    }, {} as Record<string, CheckinMapaData[]>);

    // Calcular estatísticas
    const estatisticas = {
      totalCheckins: result.length,
      totalTecnicos: Object.keys(trajetoriasPorTecnico).length,
      periodoInicio: result.length > 0 ? result[0].DATA_ISO : null,
      periodoFim: result.length > 0 ? result[result.length - 1].DATA_ISO : null,
    };

    // Calcular centro do mapa baseado nos dados
    let centro = { lat: -12.8729513, lng: -38.2990653 }; // Default: Garanhuns/PE
    
    if (result.length > 0) {
      const latitudes = result.map(r => r.LAT);
      const longitudes = result.map(r => r.LNG);
      
      centro = {
        lat: latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
        lng: longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        checkins: result,
        trajetoriasPorTecnico,
        estatisticas,
        centro,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados do mapa:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Endpoint para obter último check-in de um técnico (para atualizações em tempo real)
export async function POST(request: NextRequest) {
  try {
    const { tecnico } = await request.json();

    if (!tecnico) {
      return NextResponse.json(
        { success: false, error: 'Técnico é obrigatório' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        CHAVE,
        CONCAT(SUBSTRING(DATA, 1, 4), '-', SUBSTRING(DATA, 5, 2), '-', SUBSTRING(DATA, 7, 2)) as DATA_ISO,
        HORA,
        CLIENTE,
        NOME,
        CIDADE,
        CAST(LATITUDE AS DECIMAL(10,8)) as LAT,
        CAST(LONGITUDE AS DECIMAL(11,8)) as LNG,
        TECNICO
      FROM checkin 
      WHERE TECNICO = ?
        AND LATITUDE != '' 
        AND LONGITUDE != '' 
        AND LATITUDE != '0' 
        AND LONGITUDE != '0'
      ORDER BY DATA DESC, HORA DESC
      LIMIT 1
    `;

    const result = await executeQuery(query, [tecnico]) as CheckinMapaData[];

    return NextResponse.json({
      success: true,
      data: result[0] || null,
    });
  } catch (error) {
    console.error('Erro ao buscar último check-in:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}