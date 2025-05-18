"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Plus, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Tipo para os registros de comissão
interface ComissaoRecord {
  id: string
  codigo: string
  nome: string
  comissao: number
  senha: string
}

export default function GerenciaPage() {
  // Estado para armazenar os registros
  const [registros, setRegistros] = useState<ComissaoRecord[]>([
    {
      id: "1",
      codigo: "001",
      nome: "maria silva",
      comissao: 5.5,
      senha: "senha123",
    },
    {
      id: "2",
      codigo: "002",
      nome: "joão santos",
      comissao: 4.0,
      senha: "senha456",
    },
    {
      id: "3",
      codigo: "003",
      nome: "ana oliveira",
      comissao: 6.0,
      senha: "senha789",
    },
    {
      id: "4",
      codigo: "004",
      nome: "carlos pereira",
      comissao: 3.5,
      senha: "senha101",
    },
    {
      id: "5",
      codigo: "005",
      nome: "juliana costa",
      comissao: 5.0,
      senha: "senha202",
    },
  ])

  // Estados para o formulário
  const [codigo, setCodigo] = useState("")
  const [nome, setNome] = useState("")
  const [comissao, setComissao] = useState("0")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Estado para controlar a visibilidade das senhas na tabela
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const { toast } = useToast()

  // Resetar o formulário
  const resetForm = () => {
    setCodigo("")
    setNome("")
    setComissao("0")
    setSenha("")
    setShowPassword(false)
    setEditingId(null)
  }

  // Carregar dados para edição
  const handleEdit = (record: ComissaoRecord) => {
    setCodigo(record.codigo)
    setNome(record.nome)
    setComissao(record.comissao.toString())
    setSenha(record.senha)
    setEditingId(record.id)
  }

  // Adicionar ou atualizar registro
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!codigo || !nome || !comissao || !senha) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const formData = {
      codigo,
      nome,
      comissao: Number.parseFloat(comissao),
      senha,
    }

    if (editingId) {
      // Atualizar registro existente
      setRegistros(registros.map((reg) => (reg.id === editingId ? { ...formData, id: editingId } : reg)))
      toast({
        title: "Registro atualizado",
        description: `O registro de ${nome} foi atualizado com sucesso.`,
      })
    } else {
      // Adicionar novo registro
      setRegistros([...registros, { ...formData, id: Date.now().toString() }])
      toast({
        title: "Registro adicionado",
        description: `O registro de ${nome} foi adicionado com sucesso.`,
      })
    }

    resetForm()
  }

  // Excluir registro
  const handleDelete = (id: string) => {
    setRegistros(registros.filter((record) => record.id !== id))
    toast({
      title: "Registro excluído",
      description: "O registro foi excluído com sucesso.",
    })
  }

  // Alternar visibilidade da senha na tabela
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Mascarar senha
  const maskPassword = (password: string) => {
    return "•".repeat(password.length)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">gerência</h1>
        </div>

        {/* Formulário de cadastro */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <h2 className="mb-6 text-xl font-medium">cadastro de comissões</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label htmlFor="codigo" className="block text-sm font-medium lowercase">
                    código
                  </label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="CÓDIGO"
                    className="h-10 placeholder:uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="nome" className="block text-sm font-medium lowercase">
                    nome
                  </label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="nome"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="comissao" className="block text-sm font-medium lowercase">
                    comissão (%)
                  </label>
                  <Input
                    id="comissao"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={comissao}
                    onChange={(e) => setComissao(e.target.value)}
                    placeholder="0"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="senha" className="block text-sm font-medium lowercase">
                    senha
                  </label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="senha"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                {editingId ? (
                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">Atualizar</Button>
                  </div>
                ) : (
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="mr-1 h-4 w-4" /> adicionar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de registros */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500">
                    <th className="pb-2 pl-2 lowercase">código</th>
                    <th className="pb-2 lowercase">nome</th>
                    <th className="pb-2 lowercase">
                      comissão <span className="text-xs">(%) </span>
                    </th>
                    <th className="pb-2 lowercase">senha</th>
                    <th className="pb-2 text-right lowercase">ações</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="py-4 pl-2">{record.codigo}</td>
                      <td className="py-4">{record.nome}</td>
                      <td className="py-4">{record.comissao.toFixed(1)}%</td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {showPasswords[record.id] ? record.senha : maskPassword(record.senha)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => togglePasswordVisibility(record.id)}
                          >
                            {showPasswords[record.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            <span className="sr-only">
                              {showPasswords[record.id] ? "Esconder senha" : "Mostrar senha"}
                            </span>
                          </Button>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(record)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o registro de {record.nome}? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(record.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
