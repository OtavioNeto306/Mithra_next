'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { MetaCreate } from "@/types/metas";

interface MetasImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  errors: string[];
}

export function MetasImport({ open, onOpenChange, onImportComplete }: MetasImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<MetaCreate[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Função para baixar template
  const handleDownloadTemplate = () => {
    const headers = [
      'codigo_vendedor',
      'ano',
      'mes',
      'tipo_meta',
      'codigo_fornecedor',
      'codigo_produto',
      'valor_meta',
      'quantidade_meta',
      'observacoes'
    ];

    const exampleData = [
      'V001,2024,1,fornecedor,F001,,50000.00,25.500,Meta janeiro fornecedor A',
      'V001,2024,1,produto,,P001,30000.00,,Meta janeiro produto X',
      'V002,2024,1,fornecedor,F002,,,15.750,Meta janeiro fornecedor B por tonelada'
    ];

    const csvContent = [headers.join(','), ...exampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_metas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template baixado",
      description: "Template CSV baixado com sucesso",
    });
  };

  // Função para processar arquivo CSV
  const parseCSV = (text: string): MetaCreate[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data: MetaCreate[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });

      // Converter tipos
      const meta: MetaCreate = {
        codigo_vendedor: row.codigo_vendedor,
        ano: parseInt(row.ano),
        mes: parseInt(row.mes),
        tipo_meta: row.tipo_meta as 'fornecedor' | 'produto',
        codigo_fornecedor: row.codigo_fornecedor || undefined,
        codigo_produto: row.codigo_produto || undefined,
        valor_meta: row.valor_meta ? parseFloat(row.valor_meta) : undefined,
        quantidade_meta: row.quantidade_meta ? parseFloat(row.quantidade_meta) : undefined,
        observacoes: row.observacoes || undefined
      };

      data.push(meta);
    }

    return data;
  };

  // Função para validar dados
  const validateMeta = (meta: MetaCreate): string[] => {
    const errors: string[] = [];

    if (!meta.codigo_vendedor) errors.push('Código do vendedor é obrigatório');
    if (!meta.ano || meta.ano < 2020 || meta.ano > 2030) errors.push('Ano deve estar entre 2020 e 2030');
    if (!meta.mes || meta.mes < 1 || meta.mes > 12) errors.push('Mês deve estar entre 1 e 12');
    if (!meta.tipo_meta || !['fornecedor', 'produto'].includes(meta.tipo_meta)) {
      errors.push('Tipo de meta deve ser "fornecedor" ou "produto"');
    }
    if ((!meta.valor_meta || meta.valor_meta <= 0) && (!meta.quantidade_meta || meta.quantidade_meta <= 0)) {
      errors.push('Pelo menos um tipo de meta (valor ou quantidade) deve ser preenchido');
    }
    if (meta.tipo_meta === 'fornecedor' && !meta.codigo_fornecedor) {
      errors.push('Código do fornecedor é obrigatório para meta por fornecedor');
    }
    if (meta.tipo_meta === 'produto' && !meta.codigo_produto) {
      errors.push('Código do produto é obrigatório para meta por produto');
    }

    return errors;
  };

  // Função para processar arquivo
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de arquivo
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Erro",
        description: "Apenas arquivos CSV e Excel são aceitos",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setShowPreview(false);

    try {
      const text = await selectedFile.text();
      const parsedData = parseCSV(text);
      setPreview(parsedData.slice(0, 5)); // Mostrar apenas 5 primeiras linhas
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo",
        variant: "destructive",
      });
    }
  };

  // Função para importar dados
  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify(parsedData));

      const response = await fetch('/api/metas/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setResult({
          success: true,
          total: result.total,
          imported: result.imported,
          errors: result.errors || []
        });
        
        toast({
          title: "Importação concluída",
          description: `${result.imported} de ${result.total} metas importadas com sucesso`,
        });
        
        onImportComplete();
      } else {
        throw new Error(result.error || 'Erro na importação');
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar dados",
        variant: "destructive",
      });
      
      setResult({
        success: false,
        total: 0,
        imported: 0,
        errors: [error.message || 'Erro desconhecido']
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  // Resetar formulário
  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setShowPreview(false);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Metas via Excel/CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção de download do template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-4 w-4" />
                Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe o template CSV com a estrutura correta para importação das metas.
              </p>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Template CSV
              </Button>
            </CardContent>
          </Card>

          {/* Seção de upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload do Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Arquivo selecionado: {file.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview dos dados */}
          {showPreview && preview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview dos Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Mostrando as primeiras {preview.length} linhas do arquivo:
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Vendedor</th>
                        <th className="border border-gray-300 p-2 text-left">Ano/Mês</th>
                        <th className="border border-gray-300 p-2 text-left">Tipo</th>
                        <th className="border border-gray-300 p-2 text-left">Valor</th>
                        <th className="border border-gray-300 p-2 text-left">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((meta, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{meta.codigo_vendedor}</td>
                          <td className="border border-gray-300 p-2">{meta.ano}/{meta.mes}</td>
                          <td className="border border-gray-300 p-2">{meta.tipo_meta}</td>
                          <td className="border border-gray-300 p-2">
                            {meta.valor_meta ? `R$ ${meta.valor_meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {meta.quantidade_meta ? `${meta.quantidade_meta.toLocaleString('pt-BR', { minimumFractionDigits: 3 })} t` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress bar durante importação */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importando dados...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resultado da importação */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total de registros:</span> {result.total}
                    </div>
                    <div>
                      <span className="font-medium">Importados com sucesso:</span> {result.imported}
                    </div>
                  </div>
                  
                  {result.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">Erros encontrados:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {result.errors.slice(0, 10).map((error, index) => (
                              <li key={index} className="text-xs">{error}</li>
                            ))}
                            {result.errors.length > 10 && (
                              <li className="text-xs">... e mais {result.errors.length - 10} erros</li>
                            )}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset} disabled={importing}>
              Limpar
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={!file || importing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {importing ? 'Importando...' : 'Importar Dados'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}