'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertTriangle, Info } from 'lucide-react';
import MapaTrajetoriaLeaflet from '@/components/mapa/MapaTrajetoriaLeaflet';
import FiltrosMapa from '@/components/mapa/FiltrosMapa';

interface FiltrosMapaInterface {
  tecnico?: string;
  cliente?: string;
  dataInicio?: string;
  dataFim?: string;
}

interface Tecnico {
  id: string;
  nome: string;
}

const MapaTrajetoriaPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosMapaInterface>({
    // Filtros padrão para mostrar dados de julho de 2025 (onde há dados de teste)
    dataInicio: '2025-07-01',
    dataFim: '2025-07-31'
  });
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loadingTecnicos, setLoadingTecnicos] = useState(true);
  const [errorTecnicos, setErrorTecnicos] = useState<string | null>(null);

  // Buscar lista de técnicos disponíveis
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        setLoadingTecnicos(true);
        setErrorTecnicos(null);

        // Buscar técnicos únicos da tabela checkin
        const response = await fetch('/api/checkin/mapa');
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Erro ao buscar técnicos');
        }

        // Extrair técnicos únicos dos dados
        const tecnicosUnicos = Object.keys(result.data.trajetoriasPorTecnico || {}).map(tecnicoId => ({
          id: tecnicoId,
          nome: `Técnico ${tecnicoId}` // Por enquanto, usar ID como nome
        }));

        setTecnicos(tecnicosUnicos);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar técnicos';
        setErrorTecnicos(errorMessage);
        console.error('Erro ao buscar técnicos:', error);
      } finally {
        setLoadingTecnicos(false);
      }
    };

    fetchTecnicos();
  }, []);

  const handleFiltrosChange = (novosFiltros: FiltrosMapaInterface) => {
    setFiltros(novosFiltros);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center space-x-3">
        <MapPin className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Trajetória dos Técnicos</h1>
          <p className="text-gray-600 mt-1">
            Visualize em tempo real a trajetória e localização dos técnicos em campo
          </p>
        </div>
      </div>

      {/* Alertas e Informações */}
      <div className="space-y-4">


        {/* Informações sobre o sistema */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Como usar:</strong> Use os filtros para selecionar técnicos específicos, períodos de tempo ou clientes. 
            O mapa mostra a trajetória conectando os check-ins em ordem cronológica. 
            Clique nos marcadores para ver detalhes de cada check-in.
          </AlertDescription>
        </Alert>

        {/* Erro ao carregar técnicos */}
        {errorTecnicos && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro ao carregar dados:</strong> {errorTecnicos}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Filtros */}
      {loadingTecnicos ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <FiltrosMapa
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          tecnicos={tecnicos}
          loading={false}
        />
      )}

      {/* Mapa Principal */}
      <MapaTrajetoriaLeaflet
        tecnico={filtros.tecnico}
        dataInicio={filtros.dataInicio}
        dataFim={filtros.dataFim}
        cliente={filtros.cliente}
        altura="700px"
      />

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Legenda do Mapa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">Check-ins regulares</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
              <span className="text-sm">Último check-in do técnico</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-1 bg-blue-500 rounded"></div>
              <span className="text-sm">Trajetória do técnico</span>
            </div>
            <div className="text-xs text-gray-500 mt-3">
              <p>• Cada técnico possui uma cor diferente</p>
              <p>• Clique nos marcadores para ver detalhes</p>
              <p>• Use os filtros para personalizar a visualização</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Info className="h-5 w-5 text-green-600" />
              <span>Funcionalidades</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p><strong>✓ Visualização em tempo real</strong></p>
              <p className="text-gray-600 ml-4">Atualizações automáticas a cada 30 segundos</p>
              
              <p><strong>✓ Filtros avançados</strong></p>
              <p className="text-gray-600 ml-4">Por técnico, período, cliente</p>
              
              <p><strong>✓ Trajetória conectada</strong></p>
              <p className="text-gray-600 ml-4">Linha conectando check-ins em ordem cronológica</p>
              
              <p><strong>✓ Informações detalhadas</strong></p>
              <p className="text-gray-600 ml-4">Dados completos de cada check-in</p>
              
              <p><strong>✓ Interface responsiva</strong></p>
              <p className="text-gray-600 ml-4">Funciona em desktop e mobile</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </MainLayout>
  );
};

export default MapaTrajetoriaPage;