'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Clock, User, RefreshCw } from 'lucide-react';
import { useMapaTrajetoria } from '@/hooks/useMapaTrajetoria';

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

interface MapaTrajetoriaProps {
  tecnico?: string;
  dataInicio?: string;
  dataFim?: string;
  cliente?: string;
  altura?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const MapaTrajetoria: React.FC<MapaTrajetoriaProps> = ({
  tecnico,
  dataInicio,
  dataFim,
  cliente,
  altura = '600px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Inicializar Google Maps
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API Key não configurada');
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['geometry']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: -12.8729513, lng: -38.2990653 }, // Garanhuns/PE
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const infoWindowInstance = new google.maps.InfoWindow();
        
        setMap(mapInstance);
        setInfoWindow(infoWindowInstance);
        setMapLoaded(true);
      }
    }).catch(error => {
      console.error('Erro ao carregar Google Maps:', error);
    });
  }, []);

  // Limpar marcadores e linhas
  const clearMapElements = () => {
    markers.forEach(marker => marker.setMap(null));
    polylines.forEach(polyline => polyline.setMap(null));
    setMarkers([]);
    setPolylines([]);
  };

  // Criar marcador para check-in
  const createMarker = (checkin: CheckinMapaData, cor: string, isUltimo: boolean = false) => {
    if (!map) return null;

    const marker = new google.maps.Marker({
      position: { lat: checkin.LAT, lng: checkin.LNG },
      map: map,
      title: `${checkin.NOME} - ${checkin.HORA}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isUltimo ? 12 : 8,
        fillColor: cor,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      zIndex: isUltimo ? 1000 : checkin.ordem_sequencial
    });

    // Conteúdo do InfoWindow
    const infoContent = `
      <div class="p-3 min-w-[250px]">
        <h3 class="font-semibold text-lg mb-2">${checkin.NOME}</h3>
        <div class="space-y-1 text-sm">
          <p><strong>Cliente:</strong> ${checkin.CLIENTE}</p>
          <p><strong>Data:</strong> ${checkin.DATA_ISO}</p>
          <p><strong>Hora:</strong> ${checkin.HORA}</p>
          <p><strong>Cidade:</strong> ${checkin.CIDADE || 'Não informada'}</p>
          <p><strong>Técnico:</strong> ${checkin.TECNICO}</p>
          <p><strong>Coordenadas:</strong> ${checkin.LAT.toFixed(6)}, ${checkin.LNG.toFixed(6)}</p>
        </div>
        ${isUltimo ? '<div class="mt-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Último Check-in</span></div>' : ''}
      </div>
    `;

    marker.addListener('click', () => {
      if (infoWindow) {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
      }
    });

    return marker;
  };

  // Criar linha de trajetória
  const createPolyline = (checkins: CheckinMapaData[], cor: string) => {
    if (!map || checkins.length < 2) return null;

    const path = checkins.map(checkin => ({
      lat: checkin.LAT,
      lng: checkin.LNG
    }));

    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: cor,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: map
    });

    return polyline;
  };

  // Atualizar mapa com dados
  useEffect(() => {
    if (!map || !data || !mapLoaded) return;

    clearMapElements();

    const newMarkers: google.maps.Marker[] = [];
    const newPolylines: google.maps.Polyline[] = [];
    const cores = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    // Ajustar centro e zoom do mapa
    if (data.centro) {
      map.setCenter(data.centro);
    }

    // Criar marcadores e trajetórias para cada técnico
    Object.entries(data.trajetoriasPorTecnico).forEach(([tecnicoId, checkins], index) => {
      const cor = cores[index % cores.length];

      // Criar marcadores
      checkins.forEach((checkin, checkinIndex) => {
        const isUltimo = checkinIndex === checkins.length - 1;
        const marker = createMarker(checkin, cor, isUltimo);
        if (marker) newMarkers.push(marker);
      });

      // Criar linha de trajetória
      const polyline = createPolyline(checkins, cor);
      if (polyline) newPolylines.push(polyline);
    });

    setMarkers(newMarkers);
    setPolylines(newPolylines);

    // Ajustar bounds para mostrar todos os pontos
    if (data.checkins.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      data.checkins.forEach(checkin => {
        bounds.extend({ lat: checkin.LAT, lng: checkin.LNG });
      });
      map.fitBounds(bounds);
      
      // Garantir zoom mínimo
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 16) map.setZoom(16);
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, data, mapLoaded]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <MapPin className="mx-auto h-12 w-12 mb-4" />
            <p>Google Maps API Key não configurada.</p>
            <p className="text-sm mt-2">Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no arquivo .env</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            
            <div
              ref={mapRef}
              style={{ height: altura, width: '100%' }}
              className="rounded-lg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapaTrajetoria;