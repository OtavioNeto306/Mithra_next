"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, FileText, Printer, User, DollarSign, Truck, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

// Tipo para os detalhes do pedido
interface PedidoDetalhes {
  id: string
  codigo: string
  cliente: {
    nome: string
    email: string
    telefone: string
    endereco: string
  }
  data: string
  dataEntrega: string
  valor: number
  status: "pendente" | "faturado" | "cancelado" | "em processamento"
  itens: {
    id: string
    produto: string
    quantidade: number
    valorUnitario: number
    valorTotal: number
  }[]
  observacoes: string
  formaPagamento: string
}

// Dados mockados para os detalhes do pedido
const pedidosDetalhesMock: Record<string, PedidoDetalhes> = {
  "1": {
    id: "1",
    codigo: "PED001",
    cliente: {
      nome: "Empresa ABC Ltda",
      email: "contato@empresaabc.com",
      telefone: "(11) 98765-4321",
      endereco: "Av. Paulista, 1000, São Paulo - SP",
    },
    data: "2025-05-15",
    dataEntrega: "2025-05-20",
    valor: 2500.0,
    status: "faturado",
    itens: [
      {
        id: "1",
        produto: "Notebook Dell XPS 13",
        quantidade: 1,
        valorUnitario: 1800.0,
        valorTotal: 1800.0,
      },
      {
        id: "2",
        produto: 'Monitor Dell 24"',
        quantidade: 2,
        valorUnitario: 350.0,
        valorTotal: 700.0,
      },
    ],
    observacoes: "Entregar no departamento de TI, aos cuidados do Sr. João Silva.",
    formaPagamento: "Boleto bancário - 30 dias",
  },
  "2": {
    id: "2",
    codigo: "PED002",
    cliente: {
      nome: "Comércio XYZ",
      email: "financeiro@xyz.com",
      telefone: "(11) 91234-5678",
      endereco: "Rua Augusta, 500, São Paulo - SP",
    },
    data: "2025-05-16",
    dataEntrega: "2025-05-25",
    valor: 1800.0,
    status: "pendente",
    itens: [
      {
        id: "1",
        produto: "Impressora HP LaserJet",
        quantidade: 1,
        valorUnitario: 1200.0,
        valorTotal: 1200.0,
      },
      {
        id: "2",
        produto: "Cartucho de Toner HP",
        quantidade: 3,
        valorUnitario: 200.0,
        valorTotal: 600.0,
      },
    ],
    observacoes: "Cliente solicita entrega apenas no período da manhã.",
    formaPagamento: "Cartão de crédito - 2x",
  },
  "3": {
    id: "3",
    codigo: "PED003",
    cliente: {
      nome: "Indústria 123",
      email: "compras@industria123.com",
      telefone: "(11) 3456-7890",
      endereco: "Av. Industrial, 789, São Bernardo do Campo - SP",
    },
    data: "2025-05-14",
    dataEntrega: "2025-05-22",
    valor: 3200.0,
    status: "em processamento",
    itens: [
      {
        id: "1",
        produto: "Servidor Dell PowerEdge",
        quantidade: 1,
        valorUnitario: 2800.0,
        valorTotal: 2800.0,
      },
      {
        id: "2",
        produto: "HD Externo 2TB",
        quantidade: 2,
        valorUnitario: 200.0,
        valorTotal: 400.0,
      },
    ],
    observacoes: "Necessário agendamento prévio para entrega.",
    formaPagamento: "Transferência bancária",
  },
  "4": {
    id: "4",
    codigo: "PED004",
    cliente: {
      nome: "Distribuidora Fast",
      email: "atendimento@fast.com",
      telefone: "(11) 2345-6789",
      endereco: "Rua dos Distribuidores, 123, Guarulhos - SP",
    },
    data: "2025-05-10",
    dataEntrega: "2025-05-18",
    valor: 950.0,
    status: "cancelado",
    itens: [
      {
        id: "1",
        produto: "Roteador Wi-Fi",
        quantidade: 5,
        valorUnitario: 120.0,
        valorTotal: 600.0,
      },
      {
        id: "2",
        produto: "Cabo de Rede 5m",
        quantidade: 10,
        valorUnitario: 35.0,
        valorTotal: 350.0,
      },
    ],
    observacoes: "Pedido cancelado a pedido do cliente por atraso na entrega.",
    formaPagamento: "Boleto bancário - 15 dias",
  },
}

export default function PedidoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [pedido, setPedido] = useState<PedidoDetalhes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulando carregamento de dados
    const timer = setTimeout(() => {
      const id = Array.isArray(params.id) ? params.id[0] : params.id
      const pedidoEncontrado = pedidosDetalhesMock[id]

      if (pedidoEncontrado) {
        setPedido(pedidoEncontrado)
      } else {
        toast({
          title: "Pedido não encontrado",
          description: "O pedido solicitado não foi encontrado.",
          variant: "destructive",
        })
        router.push("/pedidos")
      }

      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [params.id, router, toast])

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

  // Ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "faturado":
        return <CheckCircle className="mr-2 h-4 w-4" />
      case "cancelado":
        return <XCircle className="mr-2 h-4 w-4" />
      case "em processamento":
        return <Truck className="mr-2 h-4 w-4" />
      case "pendente":
        return <Calendar className="mr-2 h-4 w-4" />
      default:
        return null
    }
  }

  // Simulação de impressão
  const handlePrint = () => {
    toast({
      title: "Imprimindo pedido",
      description: `Preparando impressão do pedido ${pedido?.codigo}.`,
    })
  }

  // Simulação de faturamento
  const handleFaturar = () => {
    toast({
      title: "Pedido faturado",
      description: `O pedido ${pedido?.codigo} foi faturado com sucesso.`,
    })
  }

  // Simulação de cancelamento
  const handleCancelar = () => {
    toast({
      title: "Pedido cancelado",
      description: `O pedido ${pedido?.codigo} foi cancelado.`,
      variant: "destructive",
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-lg text-muted-foreground">Carregando detalhes do pedido...</p>
        </div>
      </MainLayout>
    )
  }

  if (!pedido) {
    return (
      <MainLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Pedido não encontrado</p>
          <Button asChild>
            <Link href="/pedidos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de pedidos
            </Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/pedidos">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pedido {pedido.codigo}</h1>
              <p className="text-muted-foreground">Detalhes completos do pedido</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {pedido.status === "pendente" && (
              <Button onClick={handleFaturar}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Faturar
              </Button>
            )}
            {(pedido.status === "pendente" || pedido.status === "em processamento") && (
              <Button variant="destructive" onClick={handleCancelar}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Código:</span>
                </div>
                <span>{pedido.codigo}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Data do Pedido:</span>
                </div>
                <span>{formatarData(pedido.data)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Data de Entrega:</span>
                </div>
                <span>{formatarData(pedido.dataEntrega)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Valor Total:</span>
                </div>
                <span className="font-bold">{formatarValor(pedido.valor)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Forma de Pagamento:</span>
                </div>
                <span>{pedido.formaPagamento}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                </div>
                <Badge className={getStatusColor(pedido.status)}>
                  {getStatusIcon(pedido.status)}
                  {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Nome:</span>
                </div>
                <span>{pedido.cliente.nome}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Email:</span>
                </div>
                <span>{pedido.cliente.email}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Telefone:</span>
                </div>
                <span>{pedido.cliente.telefone}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Endereço:</span>
                </div>
                <span className="text-right">{pedido.cliente.endereco}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="itens" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="itens">Itens do Pedido</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>
          <TabsContent value="itens">
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
                <CardDescription>Lista de produtos incluídos neste pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50 text-sm">
                        <th className="px-4 py-2 text-left font-medium">Produto</th>
                        <th className="px-4 py-2 text-center font-medium">Quantidade</th>
                        <th className="px-4 py-2 text-right font-medium">Valor Unitário</th>
                        <th className="px-4 py-2 text-right font-medium">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.itens.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-3">{item.produto}</td>
                          <td className="px-4 py-3 text-center">{item.quantidade}</td>
                          <td className="px-4 py-3 text-right">{formatarValor(item.valorUnitario)}</td>
                          <td className="px-4 py-3 text-right">{formatarValor(item.valorTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          Total:
                        </td>
                        <td className="px-4 py-2 text-right font-bold">{formatarValor(pedido.valor)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="observacoes">
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>Informações adicionais sobre o pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line rounded-md border bg-muted/50 p-4">
                  {pedido.observacoes || "Nenhuma observação registrada."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
