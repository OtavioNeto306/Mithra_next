"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, FileDown, Filter, Plus, Search, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { usePedidos } from "@/hooks/usePedidos"

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const { toast } = useToast()
  
  const { 
    pedidos, 
    loading, 
    error, 
    pagination, 
    fetchPedidos, 
    refetch 
  } = usePedidos()

  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString("pt-BR")
    } catch {
      return dataString
    }
  }

  // Formatar valor para exibição
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Filtrar pedidos - agora aplicando filtros via API
  const handleSearch = async (search: string) => {
    setSearchTerm(search)
    await fetchPedidos({
      search: search || undefined,
      status: statusFilter !== "todos" ? statusFilter : undefined,
      page: 1,
    })
  }

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status)
    await fetchPedidos({
      search: searchTerm || undefined,
      status: status !== "todos" ? status : undefined,
      page: 1,
    })
  }

  // Cor do badge de acordo com o status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "faturado":
        return "bg-green-500"
      case "pendente":
        return "bg-yellow-500"
      case "cancelado":
        return "bg-red-500"
      case "em processamento":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Exportar pedidos (simulação)
  const handleExportarPedidos = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os pedidos estão sendo exportados para CSV.",
    })
  }

  // Recarregar dados
  const handleRefresh = async () => {
    await refetch()
    toast({
      title: "Dados atualizados",
      description: "A lista de pedidos foi atualizada com sucesso.",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os pedidos do sistema • {pagination.total} pedidos encontrados
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
            <Button variant="outline" onClick={handleExportarPedidos}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar pedidos: {error}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou cliente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={statusFilter} 
                  onValueChange={handleStatusFilter}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="faturado">Faturado</SelectItem>
                    <SelectItem value="em processamento">Em processamento</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Forma Pagamento</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Carregando pedidos...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : pedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        {error ? "Erro ao carregar os dados" : "Nenhum pedido encontrado."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pedidos.map((pedido) => (
                      <TableRow key={pedido.chave}>
                        <TableCell className="font-medium">{pedido.numero}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pedido.cliente.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Cód: {pedido.cliente.codigo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pedido.formaPagamento.descricao}</div>
                            <div className="text-sm text-muted-foreground">
                              Cód: {pedido.formaPagamento.codigo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatarData(pedido.emissao)}</TableCell>
                        <TableCell>{formatarValor(pedido.valor)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pedido.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(pedido.status)}>
                            {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/pedidos/${pedido.chave}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} 
                  • {pagination.total} pedidos no total
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPedidos({ 
                      page: pagination.page - 1,
                      search: searchTerm || undefined,
                      status: statusFilter !== "todos" ? statusFilter : undefined,
                    })}
                    disabled={loading || pagination.page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPedidos({ 
                      page: pagination.page + 1,
                      search: searchTerm || undefined,
                      status: statusFilter !== "todos" ? statusFilter : undefined,
                    })}
                    disabled={loading || pagination.page >= pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
