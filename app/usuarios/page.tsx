"use client"

import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react"

interface Usuario {
  id: number
  usuario: string
  nome: string
  email?: string
  ativo: number
  permissao_checkin: number
  permissao_rotas: number
  permissao_dashboard: number
  permissao_metas: number
  permissao_pedidos: number
  permissao_produtos: number
  permissao_prospects: number
  permissao_propostas: number
  permissao_vendedores: number
  permissao_configuracoes: number
  permissao_gerencia: number
  created_at: string
  updated_at: string
}

interface FormData {
  usuario: string
  nome: string
  email: string
  senha: string
  ativo: boolean
  permissao_checkin: boolean
  permissao_rotas: boolean
  permissao_dashboard: boolean
  permissao_metas: boolean
  permissao_pedidos: boolean
  permissao_produtos: boolean
  permissao_prospects: boolean
  permissao_propostas: boolean
  permissao_vendedores: boolean
  permissao_configuracoes: boolean
  permissao_gerencia: boolean
}

const initialFormData: FormData = {
  usuario: '',
  nome: '',
  email: '',
  senha: '',
  ativo: true,
  permissao_checkin: false,
  permissao_rotas: false,
  permissao_dashboard: false,
  permissao_metas: false,
  permissao_pedidos: false,
  permissao_produtos: false,
  permissao_prospects: false,
  permissao_propostas: false,
  permissao_vendedores: false,
  permissao_configuracoes: false,
  permissao_gerencia: false
}

export default function UsuariosPage() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios')
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        usuario: user.usuario,
        nome: user.nome,
        email: user.email || '',
        senha: '',
        ativo: user.ativo === 1,
        permissao_checkin: user.permissao_checkin === 1,
        permissao_rotas: user.permissao_rotas === 1,
        permissao_dashboard: user.permissao_dashboard === 1,
        permissao_metas: user.permissao_metas === 1,
        permissao_pedidos: user.permissao_pedidos === 1,
        permissao_produtos: user.permissao_produtos === 1,
        permissao_prospects: user.permissao_prospects === 1,
        permissao_propostas: user.permissao_propostas === 1,
        permissao_vendedores: user.permissao_vendedores === 1,
        permissao_configuracoes: user.permissao_configuracoes === 1,
        permissao_gerencia: user.permissao_gerencia === 1
      })
    } else {
      setEditingUser(null)
      setFormData(initialFormData)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData(initialFormData)
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        ...formData,
        ativo: formData.ativo ? 1 : 0,
        permissao_checkin: formData.permissao_checkin ? 1 : 0,
        permissao_rotas: formData.permissao_rotas ? 1 : 0,
        permissao_dashboard: formData.permissao_dashboard ? 1 : 0,
        permissao_metas: formData.permissao_metas ? 1 : 0,
        permissao_pedidos: formData.permissao_pedidos ? 1 : 0,
        permissao_produtos: formData.permissao_produtos ? 1 : 0,
        permissao_prospects: formData.permissao_prospects ? 1 : 0,
        permissao_propostas: formData.permissao_propostas ? 1 : 0,
        permissao_vendedores: formData.permissao_vendedores ? 1 : 0,
        permissao_configuracoes: formData.permissao_configuracoes ? 1 : 0,
        permissao_gerencia: formData.permissao_gerencia ? 1 : 0
      }

      if (editingUser) {
        payload.id = editingUser.id
        if (!formData.senha) {
          delete payload.senha
        }
      }

      const url = '/api/usuarios'
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar usuário')
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso.`,
      })

      handleCloseDialog()
      loadUsuarios()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar usuário.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const response = await fetch(`/api/usuarios?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário')
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      })

      loadUsuarios()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário.",
        variant: "destructive",
      })
    }
  }

  const getPermissoesBadges = (user: Usuario) => {
    const permissoes = []
    if (user.permissao_checkin) permissoes.push('Check-in')
    if (user.permissao_rotas) permissoes.push('Rotas')
    if (user.permissao_dashboard) permissoes.push('Dashboard')
    if (user.permissao_metas) permissoes.push('Metas')
    if (user.permissao_pedidos) permissoes.push('Pedidos')
    if (user.permissao_produtos) permissoes.push('Produtos')
    if (user.permissao_prospects) permissoes.push('Prospects')
    if (user.permissao_propostas) permissoes.push('Propostas')
    if (user.permissao_vendedores) permissoes.push('Vendedores')
    if (user.permissao_configuracoes) permissoes.push('Configurações')
    if (user.permissao_gerencia) permissoes.push('Gerência')
    return permissoes
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando usuários...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários e suas permissões de acesso ao sistema
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? 'Edite as informações e permissões do usuário'
                    : 'Preencha as informações para criar um novo usuário'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario">Usuário *</Label>
                    <Input
                      id="usuario"
                      value={formData.usuario}
                      onChange={(e) => setFormData(prev => ({ ...prev, usuario: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">
                    {editingUser ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha *'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                      required={!editingUser}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Usuário ativo</Label>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Permissões de Acesso</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_dashboard"
                        checked={formData.permissao_dashboard}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_dashboard: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_dashboard">Dashboard</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_checkin"
                        checked={formData.permissao_checkin}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_checkin: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_checkin">Check-in</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_rotas"
                        checked={formData.permissao_rotas}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_rotas: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_rotas">Rotas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_metas"
                        checked={formData.permissao_metas}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_metas: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_metas">Metas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_pedidos"
                        checked={formData.permissao_pedidos}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_pedidos: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_pedidos">Pedidos</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_produtos"
                        checked={formData.permissao_produtos}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_produtos: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_produtos">Produtos</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_prospects"
                        checked={formData.permissao_prospects}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_prospects: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_prospects">Prospects</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_propostas"
                        checked={formData.permissao_propostas}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_propostas: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_propostas">Propostas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_vendedores"
                        checked={formData.permissao_vendedores}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_vendedores: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_vendedores">Vendedores</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_configuracoes"
                        checked={formData.permissao_configuracoes}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_configuracoes: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_configuracoes">Configurações</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permissao_gerencia"
                        checked={formData.permissao_gerencia}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, permissao_gerencia: !!checked }))
                        }
                      />
                      <Label htmlFor="permissao_gerencia">Gerência</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              {usuarios.length} usuário(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.usuario}</TableCell>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.ativo ? "default" : "secondary"}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getPermissoesBadges(user).map((permissao) => (
                          <Badge key={permissao} variant="outline" className="text-xs">
                            {permissao}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {usuarios.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário cadastrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}