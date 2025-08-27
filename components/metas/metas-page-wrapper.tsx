'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Target, TrendingUp, Users, Upload } from "lucide-react";
import { MetasTable } from "@/components/metas/metas-table";
import { MetasForm } from "@/components/metas/metas-form";
import { MetasImport } from "@/components/metas/metas-import";
import { CurrencyDisplay } from "@/components/metas/currency-display";
import { useMetas } from "@/hooks/useMetas";
import { Meta, MetaCreate, MetaUpdate, MetaFilter } from "@/types/metas";

export function MetasPageWrapper() {
  const { metas, loading, error, fetchMetas, createMeta, updateMeta, deleteMeta, paginacao } = useMetas();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar metas na inicialização
  useEffect(() => {
    if (mounted) {
      fetchMetas();
    }
  }, [mounted]);

  // Manipular criação de nova meta
  const handleCreateMeta = async (data: MetaCreate): Promise<boolean> => {
    setFormLoading(true);
    try {
      const success = await createMeta(data);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Meta criada com sucesso",
        });
        setShowForm(false);
        fetchMetas(); // Recarregar lista
      }
      return success;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar meta",
        variant: "destructive",
      });
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  // Manipular edição de meta
  const handleUpdateMeta = async (data: MetaUpdate): Promise<boolean> => {
    if (!editingMeta) return false;
    
    setFormLoading(true);
    try {
      const success = await updateMeta(editingMeta.id, data);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Meta atualizada com sucesso",
        });
        setShowForm(false);
        setEditingMeta(null);
        fetchMetas(); // Recarregar lista
      }
      return success;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta",
        variant: "destructive",
      });
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  // Manipular exclusão de meta
  const handleDeleteMeta = async (id: number) => {
    try {
      const success = await deleteMeta(id);
      if (success) {
        fetchMetas(); // Recarregar lista
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir meta",
        variant: "destructive",
      });
      return false;
    }
  };

  // Manipular filtros
  const handleFilter = (filters: MetaFilter) => {
    fetchMetas(filters);
  };

  // Abrir formulário para nova meta
  const handleNewMeta = () => {
    setEditingMeta(null);
    setShowForm(true);
  };

  // Abrir modal de importação
  const handleOpenImport = () => {
    setShowImport(true);
  };

  // Manipular conclusão da importação
  const handleImportComplete = () => {
    fetchMetas(); // Recarregar lista após importação
    setShowImport(false);
  };

  // Abrir formulário para editar meta
  const handleEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setShowForm(true);
  };

  // Fechar formulário
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMeta(null);
  };

  // Calcular estatísticas
  const totalMetas = metas.length;
  const metasFornecedor = metas.filter(m => m.tipo_meta === 'fornecedor').length;
  const metasProduto = metas.filter(m => m.tipo_meta === 'produto').length;
  const valorTotalMetas = metas.reduce((sum, meta) => sum + meta.valor_meta, 0);

  // Não renderizar até estar montado no cliente
  if (!mounted) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Vendedores</h1>
          <p className="text-muted-foreground">
            Gerencie as metas mensais dos vendedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Excel/CSV
          </Button>
          <Button onClick={handleNewMeta}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetas}</div>
            <p className="text-xs text-muted-foreground">
              Metas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Fornecedor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metasFornecedor}</div>
            <p className="text-xs text-muted-foreground">
              Metas por fornecedor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Produto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metasProduto}</div>
            <p className="text-xs text-muted-foreground">
              Metas por produto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay value={valorTotalMetas} />
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todas as metas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de metas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <MetasTable
            metas={metas}
            loading={loading}
            error={error}
            onEdit={handleEditMeta}
            onDelete={handleDeleteMeta}
            onFilter={handleFilter}
            onNew={handleNewMeta}
            paginacao={paginacao}
          />
        </CardContent>
      </Card>

      {/* Modal do formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeta ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
          </DialogHeader>
          <MetasForm
            meta={editingMeta || undefined}
            onSubmit={async (data) => {
              if (editingMeta) {
                return await handleUpdateMeta(data as MetaUpdate);
              } else {
                return await handleCreateMeta(data as MetaCreate);
              }
            }}
            onCancel={handleCloseForm}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de importação */}
      <MetasImport
        open={showImport}
        onOpenChange={setShowImport}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}