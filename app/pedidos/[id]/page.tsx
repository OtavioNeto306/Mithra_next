"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Printer, 
  User, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import Link from "next/link"
import { usePedidoDetalhe } from "@/hooks/usePedidos"

export default function PedidoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const { pedido, loading, error, fetchPedido } = usePedidoDetalhe()

  useEffect(() => {
    if (!params || !params.id) {
      toast({
        title: "Erro",
        description: "Parâmetros inválidos.",
        variant: "destructive",
      })
      router.push("/pedidos")
      return
    }

    const id = Array.isArray(params.id) ? params.id[0] : params.id
    fetchPedido(id)
  }, [params, router, toast, fetchPedido])

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar pedido",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

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
        return <CheckCircle className="h-4 w-4" />
      case "pendente":
        return <Calendar className="h-4 w-4" />
      case "cancelado":
        return <XCircle className="h-4 w-4" />
      case "em processamento":
        return <Truck className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Ações do pedido
  const handlePrint = () => {
    toast({
      title: "Impressão iniciada",
      description: "O pedido está sendo enviado para impressão.",
    })
  }

  const handleFaturar = () => {
    toast({
      title: "Faturamento iniciado",
      description: "O pedido está sendo processado para faturamento.",
    })
  }

  const handleCancelar = () => {
    toast({
      title: "Cancelamento solicitado",
      description: "O pedido foi marcado para cancelamento.",
      variant: "destructive",
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Carregando detalhes do pedido...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !pedido) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/pedidos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Erro</h1>
              <p className="text-muted-foreground">Não foi possível carregar os detalhes do pedido</p>
            </div>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Pedido não encontrado"}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/pedidos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Orçamento #{pedido.numero}
              </h1>
              <p className="text-muted-foreground">
                Chave: {pedido.chave} • Emitido em {formatarData(pedido.emissao)}
              </p>
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
            {pedido.status !== "cancelado" && (
              <Button variant="destructive" onClick={handleCancelar}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Status do Pedido */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(pedido.status)}
                <Badge className={`${getStatusColor(pedido.status)} text-white`}>
                  {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatarValor(pedido.valor)}</div>
                <div className="text-sm text-muted-foreground">Valor Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="detalhes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="itens">Itens</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Informações do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="font-medium">{pedido.cliente.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      Código: {pedido.cliente.codigo}
                    </div>
                  </div>
                  
                  {pedido.cliente.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {pedido.cliente.email}
                    </div>
                  )}
                  
                  {pedido.cliente.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {pedido.cliente.telefone}
                    </div>
                  )}
                  
                  {pedido.cliente.endereco && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <div>
                        {pedido.cliente.endereco}
                        {pedido.cliente.bairro && (
                          <div>{pedido.cliente.bairro}</div>
                        )}
                        {pedido.cliente.municipio && pedido.cliente.estado && (
                          <div>{pedido.cliente.municipio} - {pedido.cliente.estado}</div>
                        )}
                        {pedido.cliente.cep && (
                          <div>CEP: {pedido.cliente.cep}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {pedido.cliente.cgc && (
                    <div className="text-sm text-muted-foreground">
                      CNPJ/CPF: {pedido.cliente.cgc}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações do Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informações do Orçamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Tipo</div>
                      <div className="text-muted-foreground">{pedido.tipo}</div>
                    </div>
                    <div>
                      <div className="font-medium">Condição Pagamento</div>
                      <div className="text-muted-foreground">{pedido.condicaoPagamento}</div>
                    </div>
                    {pedido.vendedor && (
                      <div>
                        <div className="font-medium">Vendedor</div>
                        <div className="text-muted-foreground">{pedido.vendedor}</div>
                      </div>
                    )}
                    {pedido.filial && (
                      <div>
                        <div className="font-medium">Filial</div>
                        <div className="text-muted-foreground">{pedido.filial}</div>
                      </div>
                    )}
                  </div>
                  
                  {pedido.transportadora && (
                    <div>
                      <div className="font-medium">Transportadora</div>
                      <div className="text-muted-foreground">{pedido.transportadora}</div>
                    </div>
                  )}
                  
                  {pedido.observacoes && (
                    <div>
                      <div className="font-medium">Observações</div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {pedido.observacoes}
                      </div>
                    </div>
                  )}
                  
                  {pedido.observacoesInternas && (
                    <div>
                      <div className="font-medium">Observações Internas</div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {pedido.observacoesInternas}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="itens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Itens do Orçamento
                </CardTitle>
                <CardDescription>
                  {pedido.itens.length} item(ns) no orçamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pedido.itens.map((item) => (
                    <div
                      key={item.ordem}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.produto.descricao}</div>
                        <div className="text-sm text-muted-foreground">
                          Código: {item.produto.codigo}
                          {item.produto.grupo && ` • Grupo: ${item.produto.grupo}`}
                          {item.produto.unidade && ` • Unidade: ${item.produto.unidade}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ordem: {item.ordem}
                          {item.cfop && ` • CFOP: ${item.cfop}`}
                          {item.cst && ` • CST: ${item.cst}`}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">
                          {item.quantidade}x {formatarValor(item.valorUnitario)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          = {formatarValor(item.total)}
                        </div>
                        {item.desconto > 0 && (
                          <div className="text-sm text-red-600">
                            Desc: {formatarValor(item.desconto)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  )
}
