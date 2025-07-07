'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FileText, X, Save, Trash2 } from "lucide-react";

interface FichaTecnica {
  id?: number;
  codi_psv: string;
  marca?: string;
  modelo?: string;
  peso?: number;
  dimensoes?: string;
  cor?: string;
  material?: string;
  caracteristicas?: string;
  especificacoes_tecnicas?: string;
  observacoes?: string;
  data_cadastro?: string;
  data_atualizacao?: string;
}

interface FichaTecnicaModalProps {
  produto: {
    CODI_PSV: string;
    DESC_PSV: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function FichaTecnicaModal({ produto, isOpen, onClose, onSave }: FichaTecnicaModalProps) {
  const [fichaTecnica, setFichaTecnica] = useState<FichaTecnica>({
    codi_psv: produto.CODI_PSV,
    marca: '',
    modelo: '',
    peso: undefined,
    dimensoes: '',
    cor: '',
    material: '',
    caracteristicas: '',
    especificacoes_tecnicas: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [fichaExistente, setFichaExistente] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      carregarFichaTecnica();
    }
  }, [isOpen, produto.CODI_PSV]);

  const carregarFichaTecnica = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/produtos/ficha-tecnica?codi_psv=${encodeURIComponent(produto.CODI_PSV.trim())}`);
      const data = await response.json();
      
      if (data.ficha_tecnica) {
        setFichaTecnica(data.ficha_tecnica);
        setFichaExistente(true);
      } else {
        // Resetar para valores padrão se não existe ficha técnica
        setFichaTecnica({
          codi_psv: produto.CODI_PSV,
          marca: '',
          modelo: '',
          peso: undefined,
          dimensoes: '',
          cor: '',
          material: '',
          caracteristicas: '',
          especificacoes_tecnicas: '',
          observacoes: ''
        });
        setFichaExistente(false);
      }
    } catch (error) {
      console.error('Erro ao carregar ficha técnica:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar ficha técnica",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarFichaTecnica = async () => {
    try {
      setSalvando(true);
      
      const response = await fetch('/api/produtos/ficha-tecnica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fichaTecnica),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Ficha técnica salva com sucesso",
        });
        setFichaExistente(true);
        onSave?.();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao salvar ficha técnica",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar ficha técnica:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar ficha técnica",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const deletarFichaTecnica = async () => {
    if (!fichaExistente) {
      toast({
        title: "Erro",
        description: "Este produto não possui ficha técnica para deletar",
        variant: "destructive",
      });
      return;
    }

    // Confirmar a ação
    if (!confirm(`Tem certeza que deseja deletar a ficha técnica do produto ${produto.CODI_PSV}?`)) {
      return;
    }

    try {
      setDeletando(true);
      
      const response = await fetch(`/api/produtos/ficha-tecnica?codi_psv=${encodeURIComponent(produto.CODI_PSV.trim())}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Ficha técnica deletada com sucesso",
        });
        setFichaExistente(false);
        // Resetar campos
        setFichaTecnica({
          codi_psv: produto.CODI_PSV,
          marca: '',
          modelo: '',
          peso: undefined,
          dimensoes: '',
          cor: '',
          material: '',
          caracteristicas: '',
          especificacoes_tecnicas: '',
          observacoes: ''
        });
        onSave?.();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao deletar ficha técnica",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar ficha técnica:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar ficha técnica",
        variant: "destructive",
      });
    } finally {
      setDeletando(false);
    }
  };

  const handleInputChange = (field: keyof FichaTecnica, value: string | number) => {
    setFichaTecnica(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="border-2 border-blue-500 bg-white max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ficha Técnica - {produto.DESC_PSV}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Código: {produto.CODI_PSV}</p>
          {fichaExistente && (
            <p className="text-sm text-green-600">✓ Ficha técnica cadastrada</p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando ficha técnica...</div>
          ) : (
            <div className="space-y-4">
              {/* Primeira linha: Marca e Modelo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={fichaTecnica.marca || ''}
                    onChange={(e) => handleInputChange('marca', e.target.value)}
                    placeholder="Ex: Samsung, Apple, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={fichaTecnica.modelo || ''}
                    onChange={(e) => handleInputChange('modelo', e.target.value)}
                    placeholder="Ex: Galaxy S23, iPhone 15, etc."
                  />
                </div>
              </div>

              {/* Segunda linha: Peso e Dimensões */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                                     <Input
                     id="peso"
                     type="number"
                     step="0.001"
                     value={fichaTecnica.peso?.toString() || ''}
                     onChange={(e) => handleInputChange('peso', e.target.value ? parseFloat(e.target.value) : 0)}
                     placeholder="Ex: 0.5"
                   />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensoes">Dimensões</Label>
                  <Input
                    id="dimensoes"
                    value={fichaTecnica.dimensoes || ''}
                    onChange={(e) => handleInputChange('dimensoes', e.target.value)}
                    placeholder="Ex: 10 x 20 x 5 cm"
                  />
                </div>
              </div>

              {/* Terceira linha: Cor e Material */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={fichaTecnica.cor || ''}
                    onChange={(e) => handleInputChange('cor', e.target.value)}
                    placeholder="Ex: Preto, Branco, Azul"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={fichaTecnica.material || ''}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder="Ex: Plástico, Metal, Vidro"
                  />
                </div>
              </div>

              {/* Características */}
              <div className="space-y-2">
                <Label htmlFor="caracteristicas">Características</Label>
                <Textarea
                  id="caracteristicas"
                  rows={3}
                  value={fichaTecnica.caracteristicas || ''}
                  onChange={(e) => handleInputChange('caracteristicas', e.target.value)}
                  placeholder="Descreva as principais características do produto..."
                />
              </div>

              {/* Especificações Técnicas */}
              <div className="space-y-2">
                <Label htmlFor="especificacoes_tecnicas">Especificações Técnicas</Label>
                <Textarea
                  id="especificacoes_tecnicas"
                  rows={4}
                  value={fichaTecnica.especificacoes_tecnicas || ''}
                  onChange={(e) => handleInputChange('especificacoes_tecnicas', e.target.value)}
                  placeholder="Especificações técnicas detalhadas do produto..."
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  rows={3}
                  value={fichaTecnica.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais sobre o produto..."
                />
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={salvarFichaTecnica}
                  disabled={salvando}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
                
                {fichaExistente && (
                  <Button
                    variant="outline"
                    onClick={deletarFichaTecnica}
                    disabled={deletando}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletando ? 'Deletando...' : 'Deletar'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={salvando || deletando}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 