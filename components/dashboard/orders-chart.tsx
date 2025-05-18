"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Dados mockados para o gráfico
const mockData = [
  { name: "Jan", Faturados: 65, Pendentes: 28, Perdidos: 7 },
  { name: "Fev", Faturados: 59, Pendentes: 32, Perdidos: 9 },
  { name: "Mar", Faturados: 80, Pendentes: 25, Perdidos: 5 },
  { name: "Abr", Faturados: 81, Pendentes: 30, Perdidos: 10 },
  { name: "Mai", Faturados: 56, Pendentes: 20, Perdidos: 8 },
  { name: "Jun", Faturados: 55, Pendentes: 15, Perdidos: 6 },
  { name: "Jul", Faturados: 40, Pendentes: 22, Perdidos: 4 },
]

export function OrdersChart() {
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
      <BarChart
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
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Faturados" fill="#22c55e" />
        <Bar dataKey="Pendentes" fill="#3b82f6" />
        <Bar dataKey="Perdidos" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
