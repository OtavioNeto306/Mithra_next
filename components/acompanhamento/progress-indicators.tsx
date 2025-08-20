'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProgressoMeta } from '@/types/metas';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorsProps {
  progressos: ProgressoMeta[];
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

function getStatusConfig(status: string) {
  switch (status) {
    case 'superada':
      return {
        label: 'Superada',
        variant: 'default' as const,
        color: 'bg-green-500',
        icon: TrendingUp,
        textColor: 'text-green-700'
      };
    case 'atingida':
      return {
        label: 'Atingida',
        variant: 'secondary' as const,
        color: 'bg-blue-500',
        icon: Target,
        textColor: 'text-blue-700'
      };
    case 'em_andamento':
      return {
        label: 'Em Andamento',
        variant: 'outline' as const,
        color: 'bg-yellow-500',
        icon: TrendingUp,
        textColor: 'text-yellow-700'
      };
    case 'nao_iniciado':
      return {
        label: 'Não Iniciado',
        variant: 'destructive' as const,
        color: 'bg-gray-400',
        icon: Minus,
        textColor: 'text-gray-600'
      };
    default:
      return {
        label: 'Desconhecido',
        variant: 'outline' as const,
        color: 'bg-gray-400',
        icon: Minus,
        textColor: 'text-gray-600'
      };
  }
}

function ProgressCard({ progresso }: { progresso: ProgressoMeta }) {
  const statusConfig = getStatusConfig(progresso.status);
  const Icon = statusConfig.icon;
  const progressValue = Math.min(progresso.percentual_atingido, 100);
  const isOverTarget = progresso.percentual_atingido > 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", statusConfig.textColor)} />
            <CardTitle className="text-sm font-medium">
              {progresso.tipo_meta === 'fornecedor' ? 'Fornecedor' : 'Produto'}
            </CardTitle>
          </div>
          <Badge variant={statusConfig.variant} className="text-xs">
            {statusConfig.label}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {progresso.tipo_meta === 'fornecedor' 
            ? `Código: ${progresso.codigo_fornecedor}`
            : `Código: ${progresso.codigo_produto}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valores */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Meta</p>
            <p className="font-medium">{formatCurrency(progresso.valor_meta)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Realizado</p>
            <p className="font-medium">{formatCurrency(progresso.valor_realizado)}</p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className={cn(
              "text-xs font-medium",
              isOverTarget ? "text-green-600" : 
              progressValue >= 80 ? "text-blue-600" : 
              progressValue >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {progresso.percentual_atingido.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={progressValue} 
              className="h-2"
            />
            {isOverTarget && (
              <div className="absolute top-0 left-0 h-2 bg-green-500 rounded-full animate-pulse"
                   style={{ width: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Diferença */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {progresso.diferenca >= 0 ? 'Excedente' : 'Faltante'}
            </span>
            <span className={cn(
              "font-medium",
              progresso.diferenca >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {progresso.diferenca >= 0 ? '+' : ''}{formatCurrency(Math.abs(progresso.diferenca))}
            </span>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Vendedor:</span>
            <span>{progresso.nome_vendedor} ({progresso.codigo_vendedor})</span>
          </div>
          <div className="flex justify-between">
            <span>Período:</span>
            <span>{progresso.mes.toString().padStart(2, '0')}/{progresso.ano}</span>
          </div>
          <div className="flex justify-between">
            <span>Vendas:</span>
            <span>{progresso.vendas.length} pedido(s)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressIndicators({ progressos, loading = false }: ProgressIndicatorsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Indicadores de Progresso</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!progressos || progressos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Indicadores de Progresso</h3>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma meta encontrada</p>
              <p className="text-sm">Ajuste os filtros para visualizar o progresso das metas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Indicadores de Progresso</h3>
        <Badge variant="outline" className="ml-auto">
          {progressos.length} meta(s)
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {progressos.map((progresso) => (
          <ProgressCard key={progresso.meta_id} progresso={progresso} />
        ))}
      </div>
    </div>
  );
}