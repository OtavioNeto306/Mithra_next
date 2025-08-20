'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryData {
  total_metas: number;
  metas_atingidas: number;
  valor_total_metas: number;
  valor_total_realizado: number;
  percentual_geral: number;
}

interface SummaryCardsProps {
  data: SummaryData | null;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function SummaryCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  loading = false,
  className 
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 w-4 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-20 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", getTrendColor())} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ data, loading = false }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SummaryCard
            key={index}
            title=""
            value=""
            description=""
            icon={Target}
            loading={true}
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="md:col-span-2 lg:col-span-5">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Dados não disponíveis</p>
              <p className="text-sm">Aplique filtros para visualizar o resumo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentualAtingimento = data.total_metas > 0 ? (data.metas_atingidas / data.total_metas) * 100 : 0;
  const diferenca = data.valor_total_realizado - data.valor_total_metas;
  const metasPendentes = data.total_metas - data.metas_atingidas;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total de Metas */}
      <SummaryCard
        title="Total de Metas"
        value={data.total_metas.toString()}
        description="Metas cadastradas no período"
        icon={Target}
        trend="neutral"
      />

      {/* Metas Atingidas */}
      <SummaryCard
        title="Metas Atingidas"
        value={data.metas_atingidas.toString()}
        description={`${formatPercentage(percentualAtingimento)} do total`}
        icon={CheckCircle}
        trend={percentualAtingimento >= 70 ? 'up' : percentualAtingimento >= 40 ? 'neutral' : 'down'}
        className={cn(
          percentualAtingimento >= 70 ? 'border-green-200 bg-green-50' :
          percentualAtingimento >= 40 ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        )}
      />

      {/* Metas Pendentes */}
      <SummaryCard
        title="Metas Pendentes"
        value={metasPendentes.toString()}
        description={metasPendentes > 0 ? 'Requerem atenção' : 'Todas atingidas!'}
        icon={Clock}
        trend={metasPendentes === 0 ? 'up' : 'down'}
      />

      {/* Valor Total das Metas */}
      <SummaryCard
        title="Valor das Metas"
        value={formatCurrency(data.valor_total_metas)}
        description="Valor total estabelecido"
        icon={DollarSign}
        trend="neutral"
      />

      {/* Performance Geral */}
      <SummaryCard
        title="Performance Geral"
        value={formatPercentage(data.percentual_geral)}
        description={diferenca >= 0 ? 
          `+${formatCurrency(diferenca)} acima da meta` : 
          `${formatCurrency(Math.abs(diferenca))} abaixo da meta`
        }
        icon={TrendingUp}
        trend={data.percentual_geral >= 100 ? 'up' : data.percentual_geral >= 80 ? 'neutral' : 'down'}
        className={cn(
          data.percentual_geral >= 100 ? 'border-green-200 bg-green-50' :
          data.percentual_geral >= 80 ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        )}
      />
    </div>
  );
}