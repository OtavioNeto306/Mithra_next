"use client"

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserCircle, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface User {
  USUARIO: string;
  NOME: string;
  USERNAME: string;
  PASSWORD: string;
  UACESSO: string;
  BLOQUEADO: number;
  COMISSAO: string;
}

const ITEMS_PER_PAGE = 10;

export default function GerenciaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [editStates, setEditStates] = useState<Record<string, { comissao: string; password: string; showPassword: boolean; loading: boolean; editingPassword: boolean }>>({});

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Erro ao carregar usuários');
        const data = await response.json();
        setUsers(data);
        // Inicializa os estados de edição
        const initialEditStates: Record<string, { comissao: string; password: string; showPassword: boolean; loading: boolean; editingPassword: boolean }> = {};
        data.forEach((user: User) => {
          initialEditStates[user.USUARIO] = {
            comissao: user.COMISSAO || '',
            password: '',
            showPassword: false,
            loading: false,
            editingPassword: false,
          };
        });
        setEditStates(initialEditStates);
      } catch (error) {
        toast({
          title: 'Erro Inesperado',
          description: 'Não foi possível carregar a lista de usuários. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [toast]);

  const filteredUsers = users.filter(user =>
    user.NOME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.USUARIO.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentUsersOnPage = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleFieldChange = (codigo: string, field: 'comissao' | 'password', value: string) => {
    setEditStates((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        [field]: value,
      },
    }));
  };

  const handleToggleShowPassword = (codigo: string) => {
    setEditStates((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        showPassword: !prev[codigo].showPassword,
      },
    }));
  };

  const handleEditPassword = (codigo: string) => {
    setEditStates((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        editingPassword: true,
        password: '',
        showPassword: false,
      },
    }));
  };

  const handleCancelEditPassword = (codigo: string) => {
    setEditStates((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        editingPassword: false,
        password: '',
        showPassword: false,
      },
    }));
  };

  const handleUpdate = async (codigo: string) => {
    setEditStates((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        loading: true,
      },
    }));
    try {
      const { comissao, password, editingPassword } = editStates[codigo];
      const body: any = { comissao };
      if (editingPassword && password) {
        body.password = password;
      }
      const response = await fetch(`/api/users?codigo=${codigo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Erro ao atualizar dados');
      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso',
      });
      setUsers((prev) => prev.map((u) => u.USUARIO === codigo ? { ...u, COMISSAO: comissao } : u));
      // Após salvar, esconde e limpa o campo de senha
      setEditStates((prev) => ({
        ...prev,
        [codigo]: {
          ...prev[codigo],
          loading: false,
          editingPassword: false,
          password: '',
          showPassword: false,
        },
      }));
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os dados',
        variant: 'destructive',
      });
      setEditStates((prev) => ({
        ...prev,
        [codigo]: {
          ...prev[codigo],
          loading: false,
        },
      }));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerência de Comissões</h1>
          <p className="text-muted-foreground">Edite comissão e senha diretamente na lista</p>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Edite comissão (%) e senha diretamente na tabela</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou código do usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Código</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Comissão (%)</th>
                    <th className="px-4 py-2 text-left">Senha</th>
                    <th className="px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">Carregando usuários...</td>
                    </tr>
                  ) : currentUsersOnPage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</td>
                    </tr>
                  ) : (
                    currentUsersOnPage.map((user) => (
                      <tr key={user.USUARIO} className="border-b">
                        <td className="px-4 py-2 font-medium">{user.USUARIO}</td>
                        <td className="px-4 py-2">{user.NOME}</td>
                        <td className="px-4 py-2">
                          <Input
                            type="text"
                            value={editStates[user.USUARIO]?.comissao ?? ''}
                            onChange={(e) => handleFieldChange(user.USUARIO, 'comissao', e.target.value)}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-2">
                          {editStates[user.USUARIO]?.editingPassword ? (
                            <div className="relative flex items-center gap-2">
                              <Input
                                type={editStates[user.USUARIO]?.showPassword ? 'text' : 'password'}
                                value={editStates[user.USUARIO]?.password ?? ''}
                                onChange={(e) => handleFieldChange(user.USUARIO, 'password', e.target.value)}
                                className="pr-10"
                                placeholder="Nova senha"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-8 top-1/2 -translate-y-1/2"
                                onClick={() => handleToggleShowPassword(user.USUARIO)}
                                tabIndex={-1}
                              >
                                {editStates[user.USUARIO]?.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => handleCancelEditPassword(user.USUARIO)}
                                tabIndex={-1}
                              >
                                X
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPassword(user.USUARIO)}
                            >
                              Alterar senha
                            </Button>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            onClick={() => handleUpdate(user.USUARIO)}
                            disabled={editStates[user.USUARIO]?.loading}
                          >
                            {editStates[user.USUARIO]?.loading ? 'Salvando...' : 'Atualizar'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredUsers.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuários
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Página anterior</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Próxima página</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}