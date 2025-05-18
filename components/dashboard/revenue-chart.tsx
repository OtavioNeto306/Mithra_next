"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Dados mockados para o gráfico
const mockData = [
  { name: "Jan", Faturamento: 42000 },
  { name: "Fev", Faturamento: 52000 },
  { name: "Mar", Faturamento: 60000 },
  { name: "Abr", Faturamento: 75000 },
  { name: "Mai", Faturamento: 68000 },
  { name: "Jun", Faturamento: 84000 },
]

// Formatador para valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Componente personalizado para o Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-emerald-500">{`Faturamento: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    )
  }

  return null
}

export function RevenueChart() {
  const [chartData, setChartData] = useState<any[]>([])

  // Simular carregamento de dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartData(mockData)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="Faturamento" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
