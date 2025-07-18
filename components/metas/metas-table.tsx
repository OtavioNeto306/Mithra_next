'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2, Search, Filter, Plus } from "lucide-react";
import { Meta, MetaFilter } from "@/types/metas";
import { CurrencyDisplay } from "@/components/metas/currency-display";
import { useVendedores } from "@/hooks/useVendedores";

interface MetasTableProps {
  metas: Meta[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (meta: Meta) => void;
  onDelete?: (id: number) => Promise<boolean>;
  onFilter?: (filters: MetaFilter) => void;
  onNew?: () => void;
  paginacao?: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export function MetasTable({ 
  metas, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onFilter,
  onNew,
  paginacao 
}: MetasTableProps) {
  const { vendedores } = useVendedores();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<MetaFilter>({});
  const [filterValues, setFilterValues] = useState({
    codigo_vendedor: 'todos',
    ano: 'todos',
    mes: 'todos',
    tipo_meta: 'todos'
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Formatar valor monetário (mantido para compatibilidade, mas não usado)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };



  // Obter nome do mês
  const getMesNome = (mes: number) => {
    return new Date(2024, mes - 1).toLocaleDateString('pt-BR', { month: 'long' });
  };

  // Obter nome do vendedor
  const getVendedorNome = (codigo: string) => {
    const vendedor = vendedores.find(v => v.CODI_PES === codigo);
    return vendedor ? vendedor.NOME_PES : codigo;
  };

  // Manipular filtros
  const handleFilterChange = (field: keyof MetaFilter, value: any) => {
    // Atualizar valores de exibição
    setFilterValues(prev => ({ ...prev, [field]: value }));
    
    // Converter "todos" para undefined para remover o filtro
    const filterValue = value === 'todos' ? undefined : value;
    const newFilters = { ...filters, [field]: filterValue };
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Manipular exclusão
  const handleDelete = async (id: number) => {
    if (!onDelete) return;

    if (!confirm('Tem certeza que deseja excluir esta meta?')) {
      return;
    }

    setDeletingId(id);
    try {
      const success = await onDelete(id);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Meta excluída com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir meta",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Carregando metas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
                    <div className="relative w-[200px]">
            <Input
              type="text"
              placeholder="Buscar vendedor..."
              value={filterValues.codigo_vendedor === 'todos' ? '' : filterValues.codigo_vendedor}
              onChange={(e) => {
                const value = e.target.value;
                if (value.trim() === '') {
                  handleFilterChange('codigo_vendedor', 'todos');
                } else {
                  handleFilterChange('codigo_vendedor', value);
                }
              }}
              className="w-full"
            />
          </div>

          <Select
            value={filterValues.ano}
            onValueChange={(value) => handleFilterChange('ano', value === 'todos' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterValues.mes}
            onValueChange={(value) => handleFilterChange('mes', value === 'todos' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                <SelectItem key={mes} value={mes.toString()}>
                  {getMesNome(mes)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterValues.tipo_meta}
            onValueChange={(value) => handleFilterChange('tipo_meta', value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="fornecedor">Por Fornecedor</SelectItem>
              <SelectItem value="produto">Por Produto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {onNew && (
          <Button onClick={onNew} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fornecedor/Produto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-sm text-muted-foreground">
                    Nenhuma meta encontrada
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{meta.codigo_vendedor}</div>
                      <div className="text-sm text-muted-foreground">
                        {getVendedorNome(meta.codigo_vendedor)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getMesNome(meta.mes)}/{meta.ano}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.tipo_meta === 'fornecedor' ? 'default' : 'secondary'}>
                      {meta.tipo_meta === 'fornecedor' ? 'Fornecedor' : 'Produto'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {meta.tipo_meta === 'fornecedor' 
                        ? meta.codigo_fornecedor 
                        : meta.codigo_produto
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      <CurrencyDisplay value={meta.valor_meta} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {meta.observacoes || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(meta.data_cadastro)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(meta)}
                          disabled={deletingId === meta.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(meta.id)}
                          disabled={deletingId === meta.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {paginacao && paginacao.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((paginacao.pagina - 1) * paginacao.limite) + 1} a{' '}
            {Math.min(paginacao.pagina * paginacao.limite, paginacao.total)} de{' '}
            {paginacao.total} metas
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilter?.({ ...filters, page: paginacao.pagina - 1 })}
              disabled={paginacao.pagina <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilter?.({ ...filters, page: paginacao.pagina + 1 })}
              disabled={paginacao.pagina >= paginacao.totalPaginas}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 