"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, AlertTriangle, CheckCircle } from "lucide-react"

export function MetricsCards() {
  // Dados mockados para as métricas
  const metrics = [
    {
      title: "Pedidos Faturados",
      value: "128",
      description: "Mês atual",
      icon: CheckCircle,
      color: "text-green-500",
      change: "+14% em relação ao mês anterior",
    },
    {
      title: "Pedidos Pendentes",
      value: "42",
      description: "Aguardando processamento",
      icon: Package,
      color: "text-blue-500",
      change: "-5% em relação ao mês anterior",
    },
    {
      title: "Pedidos Perdidos",
      value: "12",
      description: "Mês atual",
      icon: AlertTriangle,
      color: "text-red-500",
      change: "-2% em relação ao mês anterior",
    },
    {
      title: "Valor Total",
      value: "R$ 84.325,00",
      description: "Faturamento do mês",
      icon: DollarSign,
      color: "text-emerald-500",
      change: "+12% em relação ao mês anterior",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
            <p className={`mt-2 text-xs ${metric.change.includes("+") ? "text-green-500" : "text-red-500"}`}>
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
