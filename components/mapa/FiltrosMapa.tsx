'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FiltrosMapa {
  tecnico?: string;
  dataInicio?: string;
  dataFim?: string;
  cliente?: string;
}

interface FiltrosMapaProps {
  filtros: FiltrosMapa;
  onFiltrosChange: (filtros: FiltrosMapa) => void;
  tecnicos?: Array<{ id: string; nome: string }>;
  loading?: boolean;
}

const FiltrosMapa: React.FC<FiltrosMapaProps> = ({
  filtros,
  onFiltrosChange,
  tecnicos = [],
  loading = false
}) => {
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosMapa>(filtros);
  const [dataInicioCalendar, setDataInicioCalendar] = useState<Date | undefined>(
    filtros.dataInicio ? new Date(filtros.dataInicio) : undefined
  );
  const [dataFimCalendar, setDataFimCalendar] = useState<Date | undefined>(
    filtros.dataFim ? new Date(filtros.dataFim) : undefined
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleFiltroChange = (campo: keyof FiltrosMapa, valor: string | undefined) => {
    const novosFiltros = { ...filtrosLocais, [campo]: valor };
    setFiltrosLocais(novosFiltros);
  };

  const aplicarFiltros = () => {
    onFiltrosChange(filtrosLocais);
  };

  const limparFiltros = () => {
    const filtrosVazios = {};
    setFiltrosLocais(filtrosVazios);
    setDataInicioCalendar(undefined);
    setDataFimCalendar(undefined);
    onFiltrosChange(filtrosVazios);
  };

  const handleDataInicioChange = (data: Date | undefined) => {
    setDataInicioCalendar(data);
    const dataFormatada = data ? format(data, 'yyyy-MM-dd') : undefined;
    handleFiltroChange('dataInicio', dataFormatada);
  };

  const handleDataFimChange = (data: Date | undefined) => {
    setDataFimCalendar(data);
    const dataFormatada = data ? format(data, 'yyyy-MM-dd') : undefined;
    handleFiltroChange('dataFim', dataFormatada);
  };

  const contarFiltrosAtivos = () => {
    return Object.values(filtros).filter(valor => valor && valor.trim() !== '').length;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Filtros do Mapa</CardTitle>
            {filtrosAtivos > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filtrosAtivos} ativo{filtrosAtivos > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </CardHeader>

      {mostrarFiltros && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Técnico */}
            <div className="space-y-2">
              <Label htmlFor="tecnico">Técnico</Label>
              <Select
                value={filtrosLocais.tecnico || 'todos'}
                onValueChange={(value) => handleFiltroChange('tecnico', value === 'todos' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os técnicos</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nome} (ID: {tecnico.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="cliente"
                  placeholder="Buscar cliente..."
                  value={filtrosLocais.cliente || ''}
                  onChange={(e) => handleFiltroChange('cliente', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicioCalendar ? (
                      format(dataInicioCalendar, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicioCalendar}
                    onSelect={handleDataInicioChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2020-01-01')
                    }
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFimCalendar ? (
                      format(dataFimCalendar, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFimCalendar}
                    onSelect={handleDataFimChange}
                    disabled={(date) => {
                      const hoje = new Date();
                      const dataMinima = dataInicioCalendar || new Date('2020-01-01');
                      return date > hoje || date < dataMinima;
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filtros Ativos */}
          {filtrosAtivos > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtros Ativos:</Label>
              <div className="flex flex-wrap gap-2">
                {filtros.tecnico && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Técnico: {filtros.tecnico}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        handleFiltroChange('tecnico', undefined);
                        aplicarFiltros();
                      }}
                    />
                  </Badge>
                )}
                
                {filtros.cliente && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Cliente: {filtros.cliente}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        handleFiltroChange('cliente', undefined);
                        aplicarFiltros();
                      }}
                    />
                  </Badge>
                )}
                
                {filtros.dataInicio && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    De: {format(new Date(filtros.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        handleDataInicioChange(undefined);
                        aplicarFiltros();
                      }}
                    />
                  </Badge>
                )}
                
                {filtros.dataFim && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Até: {format(new Date(filtros.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        handleDataFimChange(undefined);
                        aplicarFiltros();
                      }}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={limparFiltros}
              disabled={loading || filtrosAtivos === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
            
            <Button
              onClick={aplicarFiltros}
              disabled={loading}
            >
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FiltrosMapa;