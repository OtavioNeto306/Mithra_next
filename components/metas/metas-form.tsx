'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MetaCreate, MetaUpdate } from "@/types/metas";
import { VendedorSearch } from "@/components/metas/vendedor-search";

interface MetasFormProps {
  meta?: MetaCreate | MetaUpdate;
  onSubmit: (data: MetaCreate | MetaUpdate) => Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
}

export function MetasForm({ meta, onSubmit, onCancel, loading = false }: MetasFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState<MetaCreate | MetaUpdate>({
    codigo_vendedor: '',
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    tipo_meta: 'fornecedor',
    codigo_fornecedor: '',
    codigo_produto: '',
    valor_meta: 0,
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulário com dados da meta se for edição
  useEffect(() => {
    if (meta) {
      setFormData(prev => ({ ...prev, ...meta }));
    }
  }, [meta]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo_vendedor) {
      newErrors.codigo_vendedor = 'Vendedor é obrigatório';
    }

    if (!formData.ano || formData.ano < 2020 || formData.ano > 2030) {
      newErrors.ano = 'Ano deve estar entre 2020 e 2030';
    }

    if (!formData.mes || formData.mes < 1 || formData.mes > 12) {
      newErrors.mes = 'Mês deve estar entre 1 e 12';
    }

    if (!formData.tipo_meta) {
      newErrors.tipo_meta = 'Tipo de meta é obrigatório';
    }

    if (formData.tipo_meta === 'fornecedor' && !formData.codigo_fornecedor) {
      newErrors.codigo_fornecedor = 'Código do fornecedor é obrigatório';
    }

    if (formData.tipo_meta === 'produto' && !formData.codigo_produto) {
      newErrors.codigo_produto = 'Código do produto é obrigatório';
    }

    if (!formData.valor_meta || formData.valor_meta <= 0) {
      newErrors.valor_meta = 'Valor da meta deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipular envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    const success = await onSubmit(formData);
    
    if (success) {
      toast({
        title: "Sucesso",
        description: meta ? "Meta atualizada com sucesso" : "Meta criada com sucesso",
      });
      
      // Limpar formulário se não for edição
      if (!meta) {
        setFormData({
          codigo_vendedor: '',
          ano: new Date().getFullYear(),
          mes: new Date().getMonth() + 1,
          tipo_meta: 'fornecedor',
          codigo_fornecedor: '',
          codigo_produto: '',
          valor_meta: 0,
          observacoes: ''
        });
      }
    }
  };

  // Manipular mudanças nos campos
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };



  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {meta ? 'Editar Meta' : 'Nova Meta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendedor */}
          <div className="space-y-2">
            <VendedorSearch
              value={formData.codigo_vendedor || ''}
              onChange={(codigo) => handleChange('codigo_vendedor', codigo)}
              disabled={loading}
              error={!!errors.codigo_vendedor}
              placeholder="Digite o nome do vendedor"
            />
            {errors.codigo_vendedor && (
              <p className="text-sm text-red-500">{errors.codigo_vendedor}</p>
            )}
          </div>

          {/* Ano e Mês */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano">Ano *</Label>
              <Select
                value={formData.ano?.toString()}
                onValueChange={(value) => handleChange('ano', parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger className={errors.ano ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ano && (
                <p className="text-sm text-red-500">{errors.ano}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mes">Mês *</Label>
              <Select
                value={formData.mes?.toString()}
                onValueChange={(value) => handleChange('mes', parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger className={errors.mes ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                    <SelectItem key={mes} value={mes.toString()}>
                      {new Date(2024, mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mes && (
                <p className="text-sm text-red-500">{errors.mes}</p>
              )}
            </div>
          </div>

          {/* Tipo de Meta */}
          <div className="space-y-2">
            <Label htmlFor="tipo_meta">Tipo de Meta *</Label>
            <Select
              value={formData.tipo_meta}
              onValueChange={(value: 'fornecedor' | 'produto') => handleChange('tipo_meta', value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.tipo_meta ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fornecedor">Por Fornecedor</SelectItem>
                <SelectItem value="produto">Por Produto</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_meta && (
              <p className="text-sm text-red-500">{errors.tipo_meta}</p>
            )}
          </div>

          {/* Código do Fornecedor ou Produto */}
          {formData.tipo_meta === 'fornecedor' && (
            <div className="space-y-2">
              <Label htmlFor="codigo_fornecedor">Código do Fornecedor *</Label>
              <Input
                id="codigo_fornecedor"
                type="text"
                value={formData.codigo_fornecedor || ''}
                onChange={(e) => handleChange('codigo_fornecedor', e.target.value)}
                placeholder="Digite o código do fornecedor"
                disabled={loading}
                className={errors.codigo_fornecedor ? 'border-red-500' : ''}
              />
              {errors.codigo_fornecedor && (
                <p className="text-sm text-red-500">{errors.codigo_fornecedor}</p>
              )}
            </div>
          )}

          {formData.tipo_meta === 'produto' && (
            <div className="space-y-2">
              <Label htmlFor="codigo_produto">Código do Produto *</Label>
              <Input
                id="codigo_produto"
                type="text"
                value={formData.codigo_produto || ''}
                onChange={(e) => handleChange('codigo_produto', e.target.value)}
                placeholder="Digite o código do produto"
                disabled={loading}
                className={errors.codigo_produto ? 'border-red-500' : ''}
              />
              {errors.codigo_produto && (
                <p className="text-sm text-red-500">{errors.codigo_produto}</p>
              )}
            </div>
          )}

          {/* Valor da Meta */}
          <div className="space-y-2">
            <Label htmlFor="valor_meta">Valor da Meta (R$) *</Label>
            <Input
              id="valor_meta"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_meta || ''}
              onChange={(e) => handleChange('valor_meta', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              disabled={loading}
              className={errors.valor_meta ? 'border-red-500' : ''}
            />
            {errors.valor_meta && (
              <p className="text-sm text-red-500">{errors.valor_meta}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais (opcional)"
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (meta ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 