"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  RefreshCw, 
  FileDown, 
  Calendar, 
  User, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { usePrevisaoVendas } from "@/hooks/usePrevisaoVendas"

export default function PrevisaoVendasPage() {
  const [vendedor, setVendedor] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [activeTab, setActiveTab] = useState("resumo")
  const [filtroAplicado, setFiltroAplicado] = useState(false)

  const { toast } = useToast()
  const {
    resumoGeral,
    pedidos,
    itens,
    produtosMaisVendidos,
    vendasPorDia,
    loading,
    error,
    totalPedidos,
    fetchAllData,
    fetchResumoGeral,
    fetchPedidos,
    fetchItens,
    fetchProdutosMaisVendidos,
    fetchVendasPorDia,
    clearData
  } = usePrevisaoVendas()

  // Função para aplicar filtros
  const handleBuscar = async () => {
    if (!vendedor) {
      toast({
        title: "Erro de validação",
        description: "Por favor, informe o código do vendedor.",
        variant: "destructive",
      })
      return
    }

    try {
      await fetchAllData(vendedor)
      setFiltroAplicado(true)
      toast({
        title: "Dados carregados",
        description: "Previsão de vendas carregada com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Erro ao buscar dados de previsão de vendas.",
        variant: "destructive",
      })
    }
  }

  // Função para limpar filtros
  const handleLimpar = () => {
    setVendedor("")
    setDataInicio("")
    setDataFim("")
    setFiltroAplicado(false)
    clearData()
  }

  // Função para formatar moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  // Função para formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Função para formatar status
  const formatarStatus = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      'PP': { label: 'Pendente', variant: 'default' },
      'FF': { label: 'Faturado', variant: 'secondary' },
      'CC': { label: 'Cancelado', variant: 'destructive' },
      'AA': { label: 'Ativo', variant: 'outline' }
    }
    
    return statusMap[status] || { label: status, variant: 'default' }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Previsão de Vendas</h1>
            <p className="text-muted-foreground mt-2">
              Visualize e analise as vendas dos últimos 30 dias
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleBuscar} 
              disabled={loading}
              variant="default"
            >
              <Search className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Buscar
            </Button>
            <Button 
              onClick={handleLimpar} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Defina os parâmetros para consultar a previsão de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendedor">Código do Vendedor *</Label>
                <Input
                  id="vendedor"
                  type="text"
                  placeholder="Digite o código do vendedor"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início (Opcional)</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim (Opcional)</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Conteúdo principal */}
        {filtroAplicado && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
              <TabsTrigger value="produtos">Top Produtos</TabsTrigger>
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            </TabsList>

            {/* Resumo Geral */}
            <TabsContent value="resumo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "..." : (resumoGeral?.TOTAL_PEDIDOS || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "..." : formatarMoeda(resumoGeral?.TOTAL_VENDAS || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Faturamento total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "..." : (resumoGeral?.TOTAL_ITENS || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Quantidade vendida
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Média por Pedido</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? "..." : formatarMoeda(resumoGeral?.MEDIA_POR_PEDIDO || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ticket médio
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Listagem de Pedidos */}
            <TabsContent value="pedidos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <CardDescription>
                    {totalPedidos} pedidos encontrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Frete</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : pedidos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Nenhum pedido encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        pedidos.map((pedido) => (
                          <TableRow key={pedido.NUMERO_PEDIDO}>
                            <TableCell className="font-medium">
                              {pedido.NUMERO_PEDIDO}
                            </TableCell>
                            <TableCell>{pedido.CLIENTE}</TableCell>
                            <TableCell>{formatarData(pedido.EMISSAO)}</TableCell>
                            <TableCell>{formatarMoeda(pedido.TOTAL)}</TableCell>
                            <TableCell>{formatarMoeda(pedido.FRETE)}</TableCell>
                            <TableCell>
                              <Badge variant={formatarStatus(pedido.STATUS).variant}>
                                {formatarStatus(pedido.STATUS).label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Itens dos Pedidos */}
            <TabsContent value="itens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Itens dos Pedidos</CardTitle>
                  <CardDescription>
                    Detalhes dos itens vendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Vlr. Unit.</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Entrega</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : itens.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Nenhum item encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        itens.slice(0, 50).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.NUMERO_PEDIDO}
                            </TableCell>
                            <TableCell>{item.PRODUTO}</TableCell>
                            <TableCell>{item.QUANTIDADE}</TableCell>
                            <TableCell>{formatarMoeda(item.VALOR_UNITARIO)}</TableCell>
                            <TableCell>{formatarMoeda(item.DESCONTO)}</TableCell>
                            <TableCell>{formatarMoeda(item.TOTAL_ITEM)}</TableCell>
                            <TableCell>{formatarData(item.ENTREGA)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Produtos Mais Vendidos */}
            <TabsContent value="produtos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
                  <CardDescription>
                    Produtos com maior volume de vendas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posição</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Quantidade Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : produtosMaisVendidos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            Nenhum produto encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        produtosMaisVendidos.map((produto, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {index + 1}º
                            </TableCell>
                            <TableCell>{produto.PRODUTO}</TableCell>
                            <TableCell>{produto.TOTAL_QUANTIDADE}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gráfico de Vendas por Dia */}
            <TabsContent value="grafico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Dia</CardTitle>
                  <CardDescription>
                    Evolução das vendas nos últimos 30 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Total do Dia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : vendasPorDia.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            Nenhuma venda encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        vendasPorDia.map((venda, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {formatarData(venda.DIA)}
                            </TableCell>
                            <TableCell>{formatarMoeda(venda.TOTAL_DIA)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Mensagem quando não há filtros aplicados */}
        {!filtroAplicado && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Previsão de Vendas
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Digite o código do vendedor e clique em "Buscar" para visualizar os dados de previsão de vendas dos últimos 30 dias.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
} 