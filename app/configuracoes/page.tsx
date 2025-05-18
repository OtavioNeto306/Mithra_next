"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [notificacoes, setNotificacoes] = useState(true)
  const [temaEscuro, setTemaEscuro] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferências Gerais</CardTitle>
            <CardDescription>Configure as preferências gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notificacoes" className="flex flex-col space-y-1">
                <span>Notificações</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Receber notificações sobre novos pedidos
                </span>
              </Label>
              <Switch id="notificacoes" checked={notificacoes} onCheckedChange={setNotificacoes} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="tema-escuro" className="flex flex-col space-y-1">
                <span>Tema Escuro</span>
                <span className="font-normal text-sm text-muted-foreground">Usar tema escuro na interface</span>
              </Label>
              <Switch id="tema-escuro" checked={temaEscuro} onCheckedChange={setTemaEscuro} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto-save" className="flex flex-col space-y-1">
                <span>Salvamento Automático</span>
                <span className="font-normal text-sm text-muted-foreground">Salvar alterações automaticamente</span>
              </Label>
              <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
