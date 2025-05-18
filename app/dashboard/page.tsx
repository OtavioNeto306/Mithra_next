"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { OrdersChart } from "@/components/dashboard/orders-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("pedidos")

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral dos pedidos e faturamento</p>
        </div>

        <MetricsCards />

        <Tabs defaultValue="pedidos" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
                <CardDescription>Distribuição dos pedidos por status nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <OrdersChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faturamento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Mensal</CardTitle>
                <CardDescription>Faturamento dos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <RevenueChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
