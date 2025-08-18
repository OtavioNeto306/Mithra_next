'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Clock, User, RefreshCw, Info } from 'lucide-react';
import { useMapaTrajetoria } from '@/hooks/useMapaTrajetoria';
import 'leaflet/dist/leaflet.css';

// Importação dinâmica para evitar problemas de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

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

interface MapaTrajetoriaLeafletProps {
  tecnico?: string;
  dataInicio?: string;
  dataFim?: string;
  cliente?: string;
  altura?: string;
}

const MapaTrajetoriaLeaflet: React.FC<MapaTrajetoriaLeafletProps> = ({
  tecnico,
  dataInicio,
  dataFim,
  cliente,
  altura = '600px'
}) => {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const {
    data,
    loading,
    error,
    refetch,
    atualizacaoAutomatica,
    toggleAtualizacaoAutomatica
  } = useMapaTrajetoria({
    tecnico,
    dataInicio,
    dataFim,
    cliente
  });

  // Configurar ícones do Leaflet
  useEffect(() => {
    setIsClient(true);
    
    const setupLeafletIcons = async () => {
      const L = await import('leaflet');
      
      // Corrigir ícones padrão do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      setLeafletLoaded(true);
    };

    setupLeafletIcons();
  }, []);

  // Criar ícones customizados para diferentes técnicos
  const createCustomIcon = async (cor: string, isUltimo: boolean = false) => {
    const L = await import('leaflet');
    
    const size = isUltimo ? 25 : 20;
    const iconHtml = `
      <div style="
        background-color: ${cor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isUltimo ? '12px' : '10px'};
      ">
        ${isUltimo ? '●' : '●'}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  // Preparar dados para o mapa
  const mapData = useMemo(() => {
    if (!data || !leafletLoaded) {
      return null;
    }

    const cores = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const markersData: any[] = [];
    const polylinesData: any[] = [];
    
    Object.entries(data.trajetoriasPorTecnico).forEach(([tecnicoId, checkins], index) => {
      const cor = cores[index % cores.length];

      // Preparar marcadores
      checkins.forEach((checkin, checkinIndex) => {
        // Validar coordenadas
        if (!checkin.LAT || !checkin.LNG) {
          return;
        }
        
        const lat = typeof checkin.LAT === 'number' ? checkin.LAT : parseFloat(String(checkin.LAT));
        const lng = typeof checkin.LNG === 'number' ? checkin.LNG : parseFloat(String(checkin.LNG));
        
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          return;
        }
        
        const isUltimo = checkinIndex === checkins.length - 1;
        markersData.push({
          ...checkin,
          LAT: lat,
          LNG: lng,
          cor,
          isUltimo,
          tecnicoId
        });
      });

      // Preparar linha de trajetória
      if (checkins.length > 1) {
        const positions = checkins
          .map(checkin => {
            if (!checkin.LAT || !checkin.LNG) {
              return { lat: 0, lng: 0, valid: false };
            }
            
            const lat = typeof checkin.LAT === 'number' ? checkin.LAT : parseFloat(String(checkin.LAT));
            const lng = typeof checkin.LNG === 'number' ? checkin.LNG : parseFloat(String(checkin.LNG));
            return { lat, lng, valid: !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 };
          })
          .filter(pos => pos.valid)
          .map(pos => [pos.lat, pos.lng] as [number, number]);
          
        if (positions.length > 1) {
          polylinesData.push({
            positions,
            cor,
            tecnicoId
          });
        }
      }
    });

    // Calcular centro e bounds
    let centro = { lat: -12.8729513, lng: -38.2990653 }; // Garanhuns/PE padrão
    let bounds: [[number, number], [number, number]] | null = null;

    if (data.checkins.length > 0) {
      const lats = data.checkins
        .map(c => {
          if (!c.LAT) return null;
          return typeof c.LAT === 'number' ? c.LAT : parseFloat(String(c.LAT));
        })
        .filter(lat => lat !== null && !isNaN(lat)) as number[];
        
      const lngs = data.checkins
        .map(c => {
          if (!c.LNG) return null;
          return typeof c.LNG === 'number' ? c.LNG : parseFloat(String(c.LNG));
        })
        .filter(lng => lng !== null && !isNaN(lng)) as number[];
      
      if (lats.length > 0 && lngs.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        centro = {
          lat: (minLat + maxLat) / 2,
          lng: (minLng + maxLng) / 2
        };
        
        bounds = [[minLat, minLng], [maxLat, maxLng]];
      }
    }

    return {
      markersData,
      polylinesData,
      centro,
      bounds,
    };
  }, [data, leafletLoaded]);

  // Componente do mapa
  const MapComponent = () => {
    if (!isClient || !leafletLoaded || !mapData) {
      return (
        <div 
          style={{ height: altura }} 
          className="flex items-center justify-center bg-gray-100 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando mapa...</span>
          </div>
        </div>
      );
    }

    return (
      <MapContainer
        center={[mapData.centro.lat, mapData.centro.lng]}
        zoom={13}
        style={{ height: altura, width: '100%' }}
        className="rounded-lg"
        bounds={mapData.bounds || undefined}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Linhas de trajetória */}
        {mapData.polylinesData.map((polylineData, index) => (
          <Polyline
            key={`polyline-${index}`}
            positions={polylineData.positions}
            color={polylineData.cor}
            weight={3}
            opacity={0.8}
          />
        ))}
        
        {/* Marcadores */}
        {mapData.markersData.map((markerData, index) => (
          <Marker
            key={`marker-${index}`}
            position={[markerData.LAT, markerData.LNG]}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <h3 className="font-semibold text-lg mb-2">{markerData.NOME}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Cliente:</strong> {markerData.CLIENTE}</p>
                  <p><strong>Data:</strong> {markerData.DATA_ISO}</p>
                  <p><strong>Hora:</strong> {markerData.HORA}</p>
                  <p><strong>Cidade:</strong> {markerData.CIDADE || 'Não informada'}</p>
                  <p><strong>Técnico:</strong> {markerData.TECNICO}</p>
                  <p><strong>Coordenadas:</strong> {markerData.LAT.toFixed(6)}, {markerData.LNG.toFixed(6)}</p>
                </div>
                {markerData.isUltimo && (
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Último Check-in
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    );
  };



  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Check-ins</p>
                  <p className="text-lg font-semibold">{data.estatisticas.totalCheckins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Técnicos</p>
                  <p className="text-lg font-semibold">{data.estatisticas.totalTecnicos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="text-xs font-medium">
                    {data.estatisticas.periodoInicio} a {data.estatisticas.periodoFim}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className={`h-4 w-4 ${atualizacaoAutomatica ? 'text-green-600 animate-spin' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm text-gray-600">Auto-atualização</p>
                    <Badge variant={atualizacaoAutomatica ? 'default' : 'secondary'} className="text-xs">
                      {atualizacaoAutomatica ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleAtualizacaoAutomatica}
                >
                  {atualizacaoAutomatica ? 'Parar' : 'Iniciar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Mapa de Trajetória dos Técnicos</h3>
        </div>
        
        <Button
          onClick={refetch}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Legenda do Mapa */}
      {data && data.checkins.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-sm">Legenda do Mapa</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {/* Check-ins regulares */}
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Check-ins regulares</span>
              </div>
              
              {/* Último check-in */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span>Último check-in do técnico</span>
              </div>
              
              {/* Trajetória */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-6 h-0.5 bg-blue-500"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full mx-1"></div>
                  <div className="w-6 h-0.5 bg-blue-500"></div>
                </div>
                <span>Trajetória do técnico</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span>• Cada técnico possui uma cor diferente</span>
                <span>• Clique nos marcadores para ver detalhes</span>
                <span>• Use os filtros para personalizar a visualização</span>
              </div>
              
              {/* Cores dos técnicos */}
              {Object.keys(data.trajetoriasPorTecnico).length > 1 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Técnicos ativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.trajetoriasPorTecnico).map(([tecnicoId, checkins], index) => {
                      const cores = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                      const cor = cores[index % cores.length];
                      const nomeCompleto = checkins[0]?.TECNICO || tecnicoId;
                      const primeiroNome = nomeCompleto.split(' ')[0];
                      
                      return (
                        <div key={tecnicoId} className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: cor }}
                          ></div>
                          <span className="text-xs">{primeiroNome}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapa */}
      <Card>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Carregando dados do mapa...</span>
                </div>
              </div>
            )}
            
            <MapComponent />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapaTrajetoriaLeaflet;