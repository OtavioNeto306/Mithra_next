'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { AcompanhamentoFilter } from '@/types/metas';
import { useAcompanhamentoMetas } from '@/hooks/useAcompanhamentoMetas';
import { Filters } from '@/components/acompanhamento/filters';
import { SummaryCards } from '@/components/acompanhamento/summary-cards';
import { EvolucaoChart } from '@/components/acompanhamento/evolucao-chart';
import { ProgressIndicators } from '@/components/acompanhamento/progress-indicators';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, BarChart3, Target, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AcompanhamentoMetasPage() {
  const [filtros, setFiltros] = useState<AcompanhamentoFilter>({
    ano: new Date().getFullYear()
  });

  const { 
    progressos, 
    evolucaoMensal, 
    resumo, 
    loading, 
    error, 
    refetch 
  } = useAcompanhamentoMetas(filtros);

  const handleFiltrosChange = (novosFiltros: AcompanhamentoFilter) => {
    setFiltros(novosFiltros);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Dados atualizados",
      description: "Os dados de acompanhamento foram recarregados com sucesso."
    });
  };

  const handleExport = () => {
    // Funcionalidade de exportação pode ser implementada futuramente
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada em breve.",
      variant: "default"
    });
  };

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <Target className="h-12 w-12 mx-auto mb-2" />
                  <h2 className="text-lg font-semibold">Erro ao carregar dados</h2>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Acompanhamento de Metas
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore o progresso das metas de vendas e compare com os resultados realizados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Filters 
        filtros={filtros} 
        onFiltrosChange={handleFiltrosChange} 
        loading={loading}
      />

      {/* Indicador de carregamento global */}
      {loading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-3 text-blue-700">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="font-medium">Carregando dados de acompanhamento...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Resumo Executivo</h2>
          {resumo && (
            <Badge variant="outline" className="ml-auto">
              {resumo.total_metas} meta(s) analisada(s)
            </Badge>
          )}
        </div>
        <SummaryCards data={resumo} loading={loading} />
      </div>

      <Separator />

      {/* Gráfico de Evolução */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Evolução Mensal</h2>
          {evolucaoMensal.length > 0 && (
            <Badge variant="outline" className="ml-auto">
              {evolucaoMensal.length} mês(es)
            </Badge>
          )}
        </div>
        <EvolucaoChart data={evolucaoMensal} loading={loading} />
      </div>

      <Separator />

      {/* Indicadores de Progresso */}
      <ProgressIndicators progressos={progressos} loading={loading} />

      {/* Rodapé com informações */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>📊 Dados atualizados em tempo real</span>
              <span>🎯 Metas baseadas no cadastro de vendedores</span>
              <span>💰 Valores em Reais (BRL)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Versão Beta
              </Badge>
              <span className="text-xs">
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}