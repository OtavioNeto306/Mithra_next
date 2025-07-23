"use client"

import { useEffect, useState } from "react"
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
  
  const { pedido, loading, error, fetchPedido } = usePedidoDetalhe();
  const [currentStatus, setCurrentStatus] = useState(pedido?.status || "");

  const DIAS_VALIDADE_ORCAMENTO = 30; // Dias de validade do orçamento

  useEffect(() => {
    if (!params || !params.id) {
      toast({
        title: "Erro",
        description: "Parâmetros inválidos.",
        variant: "destructive",
      });
      router.push("/pedidos");
      return;
    }

    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    fetchPedido(id);
  }, [params, router, toast, fetchPedido]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar pedido",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (pedido) {
      const dataEmissao = new Date(pedido.emissao);
      const dataExpiracao = new Date(dataEmissao);
      dataExpiracao.setDate(dataEmissao.getDate() + DIAS_VALIDADE_ORCAMENTO);
      
      const dataAtual = new Date();
      dataAtual.setHours(0, 0, 0, 0); // Zera a hora para comparação apenas de data

      if (pedido.status === "pendente" && dataAtual > dataExpiracao) {
        setCurrentStatus("expirado");
      } else {
        setCurrentStatus(pedido.status);
      }
    }
  }, [pedido]);

  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return dataString;
    }
  };

  // Formatar valor para exibição
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Cor do badge de acordo com o status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "faturado":
        return "bg-green-500";
      case "pendente":
        return "bg-yellow-500";
      case "cancelado":
        return "bg-red-500";
      case "em processamento":
        return "bg-blue-500";
      case "expirado":
        return "bg-purple-500"; // Cor para status expirado
      default:
        return "bg-gray-500";
    }
  };

  // Ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "faturado":
        return <CheckCircle className="h-4 w-4" />;
      case "pendente":
        return <Calendar className="h-4 w-4" />;
      case "cancelado":
        return <XCircle className="h-4 w-4" />;
      case "em processamento":
        return <Truck className="h-4 w-4" />;
      case "expirado":
        return <AlertCircle className="h-4 w-4" />; // Ícone para status expirado
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Ações do pedido
  const handlePrint = () => {
    toast({
      title: "Impressão iniciada",
      description: "O pedido está sendo enviado para impressão.",
    });
  };

  const handleFaturar = () => {
    toast({
      title: "Faturamento iniciado",
      description: "O pedido está sendo processado para faturamento.",
    });
  };

  const handleCancelar = () => {
    toast({
      title: "Cancelamento solicitado",
      description: "O pedido foi marcado para cancelamento.",
      variant: "destructive",
    });
  };

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
    );
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
    );
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
                Chave: {pedido.chave}
              </p>
            </div>
            {currentStatus && (
              <Badge className={`${getStatusColor(currentStatus)} text-white`}>
                {getStatusIcon(currentStatus)}
                <span className="ml-2">{currentStatus.toUpperCase()}</span>
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {currentStatus === "pendente" && (
              <Button onClick={handleFaturar}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Faturar
              </Button>
            )}
            {currentStatus !== "cancelado" && (
              <Button variant="destructive" onClick={handleCancelar}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="detalhes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
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
        </Tabs>
      </div>
    </MainLayout>
  );
}
