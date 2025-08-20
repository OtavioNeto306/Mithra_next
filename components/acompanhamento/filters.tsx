'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AcompanhamentoFilter } from '@/types/metas';
import { Filter, X, Search, Calendar, User, Package, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VendedorFilter } from './vendedor-filter';

interface FiltersProps {
  filtros: AcompanhamentoFilter;
  onFiltrosChange: (filtros: AcompanhamentoFilter) => void;
  loading?: boolean;
}

const ANOS_DISPONIVEIS = [2023, 2024, 2025];
const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const STATUS_OPTIONS = [
  { value: 'nao_iniciado', label: 'Não Iniciado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'atingida', label: 'Atingida' },
  { value: 'superada', label: 'Superada' }
];

export function Filters({ filtros, onFiltrosChange, loading = false }: FiltersProps) {
  const [filtrosLocais, setFiltrosLocais] = useState<AcompanhamentoFilter>(filtros);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  const handleFiltroChange = (campo: keyof AcompanhamentoFilter, valor: any) => {
    const novosFiltros = {
      ...filtrosLocais,
      [campo]: valor || undefined
    };
    setFiltrosLocais(novosFiltros);
  };

  const aplicarFiltros = () => {
    onFiltrosChange(filtrosLocais);
  };

  const limparFiltros = () => {
    const filtrosVazios: AcompanhamentoFilter = {};
    setFiltrosLocais(filtrosVazios);
    onFiltrosChange(filtrosVazios);
  };

  const contarFiltrosAtivos = () => {
    return Object.values(filtrosLocais).filter(valor => valor !== undefined && valor !== '').length;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {filtrosAtivos > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filtrosAtivos} ativo(s)
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </Button>
        </div>
        <CardDescription>
          Filtre os dados de acompanhamento por período, vendedor, tipo e status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros básicos - sempre visíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vendedor */}
          <div className="space-y-2">
            <VendedorFilter
              value={filtrosLocais.codigo_vendedor || ''}
              onChange={(codigo) => handleFiltroChange('codigo_vendedor', codigo)}
              disabled={loading}
              placeholder="Digite o nome ou código do vendedor"
            />
          </div>

          {/* Ano */}
          <div className="space-y-2">
            <Label htmlFor="ano" className="text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Ano
            </Label>
            <Select
              value={filtrosLocais.ano?.toString() || ''}
              onValueChange={(value) => handleFiltroChange('ano', value ? parseInt(value) : undefined)}
              disabled={loading}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {ANOS_DISPONIVEIS.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Meta */}
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-xs font-medium flex items-center gap-1">
              <Package className="h-3 w-3" />
              Tipo de Meta
            </Label>
            <Select
              value={filtrosLocais.tipo_meta || ''}
              onValueChange={(value) => handleFiltroChange('tipo_meta', value || undefined)}
              disabled={loading}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Tipo de meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="produto">Produto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs font-medium">Status</Label>
            <Select
              value={filtrosLocais.status || ''}
              onValueChange={(value) => handleFiltroChange('status', value || undefined)}
              disabled={loading}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Status da meta" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros avançados - visíveis quando expandido */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mês Início */}
              <div className="space-y-2">
                <Label htmlFor="mes-inicio" className="text-xs font-medium">Mês Início</Label>
                <Select
                  value={filtrosLocais.mes_inicio?.toString() || ''}
                  onValueChange={(value) => handleFiltroChange('mes_inicio', value ? parseInt(value) : undefined)}
                  disabled={loading}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Mês inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value.toString()}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mês Fim */}
              <div className="space-y-2">
                <Label htmlFor="mes-fim" className="text-xs font-medium">Mês Fim</Label>
                <Select
                  value={filtrosLocais.mes_fim?.toString() || ''}
                  onValueChange={(value) => handleFiltroChange('mes_fim', value ? parseInt(value) : undefined)}
                  disabled={loading}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Mês final" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value.toString()}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Código Fornecedor */}
              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="text-xs font-medium flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Fornecedor
                </Label>
                <Input
                  id="fornecedor"
                  placeholder="Código do fornecedor"
                  value={filtrosLocais.codigo_fornecedor || ''}
                  onChange={(e) => handleFiltroChange('codigo_fornecedor', e.target.value)}
                  disabled={loading}
                  className="text-sm"
                />
              </div>

              {/* Código Produto */}
              <div className="space-y-2">
                <Label htmlFor="produto" className="text-xs font-medium flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Produto
                </Label>
                <Input
                  id="produto"
                  placeholder="Código do produto"
                  value={filtrosLocais.codigo_produto || ''}
                  onChange={(e) => handleFiltroChange('codigo_produto', e.target.value)}
                  disabled={loading}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            onClick={aplicarFiltros}
            disabled={loading}
            size="sm"
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Aplicar Filtros
          </Button>
          <Button
            variant="outline"
            onClick={limparFiltros}
            disabled={loading || filtrosAtivos === 0}
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Carregando...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}