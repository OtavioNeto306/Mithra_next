"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [obrigarLocalizacao, setObrigarLocalizacao] = useState(false)
  const [alterarPreco, setAlterarPreco] = useState("nao")
  const [tempoLimite, setTempoLimite] = useState("30")
  const [loading, setLoading] = useState(true)

  // Carregar configurações ao iniciar
  useEffect(() => {
    async function loadConfiguracoes() {
      try {
        const response = await fetch('/api/configuracoes')
        if (!response.ok) throw new Error('Erro ao carregar configurações')
        const data = await response.json()
        
        setObrigarLocalizacao(data.obrigarLocalizacao)
        setAlterarPreco(data.alterarPreco)
        setTempoLimite(data.tempoLimite.toString())
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfiguracoes()
  }, [toast])

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          obrigarLocalizacao,
          alterarPreco,
          tempoLimite: parseInt(tempoLimite),
        }),
      })

      if (!response.ok) throw new Error('Erro ao salvar configurações')

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Carregando configurações...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações Gerais</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>Configure as preferências gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="localizacao" className="flex flex-col space-y-1">
                <span>Obrigar Localização</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Obrigar vendedor a pegar a localização
                </span>
              </Label>
              <Switch 
                id="localizacao" 
                checked={obrigarLocalizacao} 
                onCheckedChange={setObrigarLocalizacao} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alterar-preco" className="flex flex-col space-y-1">
                <span>Alterar Preço de Venda</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Permite alterar o preço de venda
                </span>
              </Label>
              <Select value={alterarPreco} onValueChange={setAlterarPreco}>
                <SelectTrigger id="alterar-preco" className="w-[200px]">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="maior">Apenas para Maior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo-limite" className="flex flex-col space-y-1">
                <span>Tempo Limite para Conversão</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Tempo limite para converter orçamento em pedido (em dias)
                </span>
              </Label>
              <Input
                id="tempo-limite"
                type="number"
                value={tempoLimite}
                onChange={(e) => setTempoLimite(e.target.value)}
                className="w-[200px]"
                min="1"
              />
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
