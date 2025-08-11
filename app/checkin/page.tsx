'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { useCheckin } from '@/hooks/useCheckin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  Building,
  Search,
  RefreshCw,
  Package // Import Package icon
} from 'lucide-react';

export default function CheckinPage() {
  const [filters, setFilters] = useState({
    cliente: '',
    tecnico: '',
    dataInicio: '',
    dataFim: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');

  const { checkinData, pagination, loading, error, refetch } = useCheckin(
    filters,
    currentPage,
    pageSize
  );

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      cliente: '',
      tecnico: '',
      dataInicio: '',
      dataFim: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCoordinate = (coord: string) => {
    if (!coord || coord === '0' || coord === '0.0') return '-';
    return parseFloat(coord).toFixed(6);
  };

  interface Product {
    PRODUTO: string;
  }

  const fetchProducts = async (chave: string) => {
    setLoadingProducts(true);
    setProductsError('');
    try {
      const response = await fetch(`/api/checkin/${chave}/produtos`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
      }
      const data = await response.json();
      setCurrentProducts(data.data);
      setShowProductsModal(true);
    } catch (err: any) {
      setProductsError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatório de Checkin</h1>
            <p className="text-muted-foreground mt-2">
              Visualize e gerencie os registros de checkin dos técnicos
            </p>
          </div>
          <Button 
            onClick={refetch} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Buscar por cliente..."
                  value={filters.cliente}
                  onChange={(e) => handleFilterChange('cliente', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tecnico">Técnico</Label>
                <Input
                  id="tecnico"
                  placeholder="Buscar por técnico..."
                  value={filters.tecnico}
                  onChange={(e) => handleFilterChange('tecnico', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                Limpar Filtros
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor="pageSize">Registros por página:</Label>
                <Select 
                  value={pageSize.toString()} 
                  onValueChange={(value) => setPageSize(parseInt(value))}
                >
                  <SelectTrigger id="pageSize" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="text-2xl font-bold">{pagination.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Página Atual</p>
                  <p className="text-2xl font-bold">{pagination.page} / {pagination.totalPages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Registros Exibidos</p>
                  <p className="text-2xl font-bold">{checkinData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Checkin</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Ações</TableHead> {/* Nova coluna para o botão */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkinData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8"> {/* Colspan ajustado */}
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">Nenhum registro encontrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      checkinData.map((item) => (
                        <TableRow key={item.CHAVE}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{item.DATA_FORMATADA}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{item.HORA_FORMATADA}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{item.NOME}</span>
                              <Badge variant="outline" className="w-fit">
                                {item.CLIENTE}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.TELEFONE || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.CIDADE || '-'}</span>
                              {item.LATITUDE && item.LONGITUDE && item.LATITUDE !== '0' && item.LONGITUDE !== '0' && (
                                <a
                                  href={`https://www.google.com/maps?q=${item.LATITUDE},${item.LONGITUDE}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 underline text-xs"
                                >
                                  Ver no Google Maps
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.TECNICO || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell> {/* Nova célula para o botão */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchProducts(String(item.CHAVE))}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Produtos
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pageSize + 1} até {Math.min(currentPage * pageSize, pagination.total)} de {pagination.total} registros
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modal de Produtos */}
      <Dialog open={showProductsModal} onOpenChange={setShowProductsModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Produtos do Checkin</DialogTitle>
            <DialogDescription>
              Lista de produtos associados a este registro de checkin.
            </DialogDescription>
          </DialogHeader>
          {loadingProducts ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando produtos...</span>
            </div>
          ) : productsError ? (
            <Alert variant="destructive">
              <AlertDescription>{productsError}</AlertDescription>
            </Alert>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum produto encontrado para este checkin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((product: Product, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{product.PRODUTO}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}