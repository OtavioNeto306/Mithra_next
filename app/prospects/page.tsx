"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileDown, Filter, Search, RefreshCw, AlertCircle, Users } from "lucide-react"
import { useProspects } from "@/hooks/useProspects"

export default function ProspectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [tecnicoFilter, setTecnicoFilter] = useState<string>("todos")
  const { toast } = useToast()
  
  const {
    prospects,
    loading,
    error,
    tecnicos,
    fetchProspects,
    refetch
  } = useProspects()

  // Carregar dados iniciais
  useEffect(() => {
    fetchProspects()
  }, [])

  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    if (!dataString) return "-"
    try {
      // Assumindo formato YYYYMMDD
      const year = dataString.substring(0, 4)
      const month = dataString.substring(4, 6)
      const day = dataString.substring(6, 8)
      return `${day}/${month}/${year}`
    } catch {
      return dataString
    }
  }

  // Formatar hora para exibição
  const formatarHora = (horaString: string) => {
    if (!horaString) return "-"
    try {
      // Assumindo formato HH:MM:SS
      return horaString.substring(0, 8)
    } catch {
      return horaString
    }
  }

  // Formatar data de nascimento
  const formatarDataNascimento = (dataString: string) => {
    if (!dataString) return "-"
    try {
      // Assumindo formato YYYYMMDD
      const year = dataString.substring(0, 4)
      const month = dataString.substring(4, 6)
      const day = dataString.substring(6, 8)
      return `${day}/${month}/${year}`
    } catch {
      return dataString
    }
  }

  // Formatar coordenadas
  const formatarCoordenada = (coordenada: string) => {
    if (!coordenada) return "-"
    try {
      const num = parseFloat(coordenada)
      return num.toFixed(6)
    } catch {
      return coordenada
    }
  }

  // Aplicar filtros
  const handleSearch = async () => {
    await fetchProspects({
      search: searchTerm || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      tecnico: tecnicoFilter !== "todos" ? tecnicoFilter : undefined,
    })
  }

  // Limpar filtros
  const handleClearFilters = async () => {
    setSearchTerm("")
    setDataInicio("")
    setDataFim("")
    setTecnicoFilter("todos")
    await fetchProspects()
  }

  // Exportar prospects (simulação)
  const handleExportarProspects = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados dos prospects estão sendo exportados para CSV.",
    })
  }

  // Recarregar dados
  const handleRefresh = async () => {
    await refetch()
    toast({
      title: "Dados atualizados",
      description: "A lista de prospects foi atualizada com sucesso.",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prospects</h1>
            <p className="text-muted-foreground">
              Gerencie e visualize todos os prospects do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportarProspects}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nome, telefone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Técnico</label>
                <Select value={tecnicoFilter} onValueChange={setTecnicoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os técnicos</SelectItem>
                    {tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.nome}>
                        {tecnico.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar prospects: {error}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Prospects - Todos os Campos ({prospects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando prospects...</span>
              </div>
            ) : prospects.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Nenhum prospect encontrado
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Não há prospects que correspondam aos filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CGC</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data Nasc.</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Inscrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Latitude</TableHead>
                      <TableHead>Longitude</TableHead>
                      <TableHead>Técnico</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prospects.map((prospect, index) => (
                      <TableRow key={prospect.CGC || index}>
                        <TableCell className="font-mono text-xs">
                          {prospect.CGC || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {prospect.NOME || "-"}
                        </TableCell>
                        <TableCell>
                          {formatarDataNascimento(prospect.DTNASC)}
                        </TableCell>
                        <TableCell>{prospect.TELEFONE || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={prospect.EMAIL}>
                          {prospect.EMAIL || "-"}
                        </TableCell>
                        <TableCell>{prospect.CIDADE || "-"}</TableCell>
                        <TableCell>{prospect.ESTADO || "-"}</TableCell>
                        <TableCell>{prospect.SEGMENTO || "-"}</TableCell>
                        <TableCell>{prospect.ANIMAL || "-"}</TableCell>
                        <TableCell>{prospect.INSCRI || "-"}</TableCell>
                        <TableCell>{formatarData(prospect.DATA)}</TableCell>
                        <TableCell>{formatarHora(prospect.HORA)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatarCoordenada(prospect.LATITUDE)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatarCoordenada(prospect.LONGITUDE)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                            {prospect.TECNICO || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}