'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Search, Image as ImageIcon, Check, Upload, Link, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/main-layout";

interface Produto {
  CODI_PSV: string;
  DESC_PSV: string;
  url_imagem?: string;
}

interface Paginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [urlImagem, setUrlImagem] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [tipoUpload, setTipoUpload] = useState<'url' | 'arquivo'>('arquivo');
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState('');
  const [salvandoImagem, setSalvandoImagem] = useState(false);
  const [deletandoImagem, setDeletandoImagem] = useState(false);
  const [paginacao, setPaginacao] = useState<Paginacao>({
    total: 0,
    pagina: 1,
    limite: 50,
    totalPaginas: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregarProdutos();
  }, [pagina, busca]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      console.log('Carregando produtos - página:', pagina, 'busca:', busca);
      const response = await fetch(`/api/produtos?page=${pagina}&limit=50&busca=${encodeURIComponent(busca)}`);
      const data = await response.json();
      console.log('Dados recebidos:', data);
      setProdutos(data.produtos);
      setPaginacao(data.paginacao);
      console.log('Produtos setados:', data.produtos?.length);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1); // Volta para primeira página ao buscar
    carregarProdutos();
  };

  const handleUploadImagem = async (produto: Produto) => {
    console.log('handleUploadImagem chamada com produto:', produto);
    setSelectedProduto(produto);
    setUrlImagem(produto.url_imagem || '');
    setArquivoSelecionado(null);
    setTipoUpload('arquivo');
    console.log('selectedProduto setado:', produto);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Apenas arquivos de imagem são permitidos",
          variant: "destructive",
        });
        return;
      }

      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 10MB permitido",
          variant: "destructive",
        });
        return;
      }

      setArquivoSelecionado(file);
    }
  };

  const uploadArquivo = async () => {
    if (!selectedProduto || !arquivoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo de imagem",
        variant: "destructive",
      });
      return;
    }

    try {
      setSalvandoImagem(true);
      
      const formData = new FormData();
      formData.append('file', arquivoSelecionado);
      formData.append('codi_psv', selectedProduto.CODI_PSV.trim());

      const response = await fetch('/api/produtos/upload-imagem', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Criar mensagem detalhada sobre o processamento
        let message = "Imagem processada e salva com sucesso";
        if (data.processing_info) {
          const info = data.processing_info;
          message += `\n📏 Dimensões: ${info.original_dimensions.width}x${info.original_dimensions.height}`;
          if (info.was_resized) {
            message += ` → ${info.final_dimensions.width}x${info.final_dimensions.height}`;
          }
          message += `\n📦 Tamanho: ${info.original_size_kb}KB → ${info.final_size_kb}KB`;
          if (info.compression_ratio > 0) {
            message += ` (${info.compression_ratio}% menor)`;
          }
        }
        
        // Atualizar o produto selecionado com a nova URL
        setSelectedProduto(prev => prev ? {...prev, url_imagem: data.url_imagem} : null);
        
        // Forçar recarregamento da lista para atualizar cache
        await carregarProdutos();

        toast({
          title: "Sucesso",
          description: message,
        });
        setArquivoSelecionado(null);
        setSelectedProduto(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao enviar imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setSalvandoImagem(false);
    }
  };

  const salvarImagemUrl = async () => {
    if (!selectedProduto || !urlImagem.trim()) {
      toast({
        title: "Erro",
        description: "URL da imagem é obrigatória",
        variant: "destructive",
      });
      return;
    }

    try {
      setSalvandoImagem(true);
      const response = await fetch('/api/produtos/imagem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codi_psv: selectedProduto.CODI_PSV.trim(),
          url_imagem: urlImagem.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Imagem salva com sucesso",
        });
        setUrlImagem('');
        setSelectedProduto(null);
        // Recarregar produtos para mostrar a nova imagem
        await carregarProdutos();
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao salvar imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar imagem",
        variant: "destructive",
      });
    } finally {
      setSalvandoImagem(false);
    }
  };

  const cancelarEdicao = () => {
    setSelectedProduto(null);
    setUrlImagem('');
    setArquivoSelecionado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deletarImagem = async (produto: Produto) => {
    if (!produto.url_imagem) {
      toast({
        title: "Erro",
        description: "Este produto não possui imagem para deletar",
        variant: "destructive",
      });
      return;
    }

    // Confirmar a ação
    if (!confirm(`Tem certeza que deseja deletar a imagem do produto ${produto.CODI_PSV}?`)) {
      return;
    }

    try {
      setDeletandoImagem(true);
      
      const response = await fetch(`/api/produtos/delete-imagem?codi_psv=${encodeURIComponent(produto.CODI_PSV.trim())}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Recarregar a lista de produtos para atualizar a interface
        await carregarProdutos();

        toast({
          title: "Sucesso",
          description: "Imagem deletada com sucesso",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao deletar imagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar imagem",
        variant: "destructive",
      });
    } finally {
      setDeletandoImagem(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie produtos e adicione imagens</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBusca} className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código ou descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </div>
            </form>

            {loading ? (
              <div className="text-center py-4">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-4">Nenhum produto encontrado</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((produto, index) => (
                      <TableRow key={`${produto.CODI_PSV}-${index}`}>
                        <TableCell className="font-medium">{produto.CODI_PSV}</TableCell>
                        <TableCell>{produto.DESC_PSV}</TableCell>
                        <TableCell>
                          {produto.url_imagem ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={`${produto.url_imagem}?t=${Date.now()}`} 
                                alt={produto.DESC_PSV}
                                className="w-16 h-16 object-cover rounded-md border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <Check className="h-4 w-4 text-green-500" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-sm">Sem imagem</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Botão clicado para produto:', produto.CODI_PSV);
                                handleUploadImagem(produto);
                              }}
                            >
                              {produto.url_imagem ? 'Alterar Imagem' : 'Adicionar Imagem'}
                            </Button>
                            {produto.url_imagem && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletarImagem(produto)}
                                disabled={deletandoImagem}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {produtos.length} de {paginacao.total} produtos (página {pagina} de {paginacao.totalPaginas})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPagina(p => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPagina(p => Math.min(paginacao.totalPaginas, p + 1))}
                      disabled={pagina === paginacao.totalPaginas}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {selectedProduto && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="border-2 border-blue-500 bg-white max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {selectedProduto.url_imagem ? 'Alterar' : 'Adicionar'} Imagem - {selectedProduto.DESC_PSV}
                </CardTitle>
                <p className="text-sm text-gray-600">Código: {selectedProduto.CODI_PSV}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Abas para escolher tipo de upload */}
                  <div className="flex border-b">
                    <button
                      className={`px-4 py-2 font-medium ${
                        tipoUpload === 'arquivo' 
                          ? 'border-b-2 border-blue-500 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setTipoUpload('arquivo')}
                    >
                      <Upload className="inline w-4 h-4 mr-2" />
                      Enviar Arquivo
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        tipoUpload === 'url' 
                          ? 'border-b-2 border-blue-500 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setTipoUpload('url')}
                    >
                      <Link className="inline w-4 h-4 mr-2" />
                      URL da Imagem
                    </button>
                  </div>

                  {/* Conteúdo baseado no tipo selecionado */}
                  {tipoUpload === 'arquivo' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selecionar arquivo de imagem
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formatos aceitos: JPG, PNG, GIF, WebP. Máximo 10MB.<br/>
                          ✨ Imagens serão automaticamente redimensionadas para 600x600px e comprimidas para até 500KB.
                        </p>
                      </div>

                      {arquivoSelecionado && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            <strong>Arquivo selecionado:</strong> {arquivoSelecionado.name}
                          </p>
                          <p className="text-xs text-green-600">
                            Tamanho: {(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-green-600">
                            Será salvo como: {selectedProduto.CODI_PSV.trim()}.{arquivoSelecionado.name.split('.').pop()}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            🔄 A imagem será automaticamente otimizada durante o upload
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={uploadArquivo}
                          disabled={salvandoImagem || !arquivoSelecionado}
                          className="flex-1"
                        >
                          {salvandoImagem ? 'Enviando...' : 'Enviar Imagem'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL da imagem
                        </label>
                        <Input
                          type="url"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={urlImagem}
                          onChange={(e) => setUrlImagem(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {urlImagem && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Pré-visualização:</p>
                          <img 
                            src={urlImagem} 
                            alt="Pré-visualização"
                            className="w-32 h-32 object-cover rounded-md border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '';
                              target.alt = 'Erro ao carregar imagem';
                              target.className = 'w-32 h-32 flex items-center justify-center border border-red-300 rounded-md text-red-500 text-sm';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={salvarImagemUrl}
                          disabled={salvandoImagem || !urlImagem.trim()}
                          className="flex-1"
                        >
                          {salvandoImagem ? 'Salvando...' : 'Salvar URL'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Imagem atual se existir */}
                  {selectedProduto.url_imagem && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Imagem atual:</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            deletarImagem(selectedProduto);
                            setSelectedProduto(null); // Fechar modal após deletar
                          }}
                          disabled={deletandoImagem}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletandoImagem ? 'Deletando...' : 'Deletar Imagem'}
                        </Button>
                      </div>
                      <img 
                        src={`${selectedProduto.url_imagem}?t=${Date.now()}`} 
                        alt={selectedProduto.DESC_PSV}
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 