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
import { Eye, FileDown, Filter, Plus, Search } from "lucide-react"
import Link from "next/link"

// Tipo para os pedidos
interface Pedido {
  id: string
  codigo: string
  cliente: string
  data: string
  valor: number
  status: "pendente" | "faturado" | "cancelado" | "em processamento"
}

// Dados mockados para os pedidos
const pedidosMock: Pedido[] = [
  {
    id: "1",
    codigo: "PED001",
    cliente: "Empresa ABC Ltda",
    data: "2025-05-15",
    valor: 2500.0,
    status: "faturado",
  },
  {
    id: "2",
    codigo: "PED002",
    cliente: "Comércio XYZ",
    data: "2025-05-16",
    valor: 1800.0,
    status: "pendente",
  },
  {
    id: "3",
    codigo: "PED003",
    cliente: "Indústria 123",
    data: "2025-05-14",
    valor: 3200.0,
    status: "em processamento",
  },
  {
    id: "4",
    codigo: "PED004",
    cliente: "Distribuidora Fast",
    data: "2025-05-10",
    valor: 950.0,
    status: "cancelado",
  },
  {
    id: "5",
    codigo: "PED005",
    cliente: "Supermercado Big",
    data: "2025-05-17",
    valor: 4200.0,
    status: "pendente",
  },
  {
    id: "6",
    codigo: "PED006",
    cliente: "Farmácia Saúde",
    data: "2025-05-12",
    valor: 1250.0,
    status: "faturado",
  },
  {
    id: "7",
    codigo: "PED007",
    cliente: "Loja de Roupas Fashion",
    data: "2025-05-13",
    valor: 3600.0,
    status: "faturado",
  },
]

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosMock)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const { toast } = useToast()

  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  // Formatar valor para exibição
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Filtrar pedidos com base no termo de pesquisa e filtro de status
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchesSearch =
      pedido.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || pedido.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">Gerencie todos os pedidos do sistema</p>
          </div>
          <div className="flex gap-2">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código ou cliente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pedidosFiltrados.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-medium">{pedido.codigo}</TableCell>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>{formatarData(pedido.data)}</TableCell>
                        <TableCell>{formatarValor(pedido.valor)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(pedido.status)}>
                            {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/pedidos/${pedido.id}`}>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
