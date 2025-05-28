"use client"

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff, Edit3, Save, XCircle, Loader2, Percent } from 'lucide-react'; // Ícone Percent adicionado

interface User {
  USUARIO: string;
  NOME: string;
  USERNAME: string;
  PASSWORD: string;
  UACESSO: string;
  BLOQUEADO: number;
  COMISSAO: string; // Mantido como string para refletir o original, mas idealmente seria number se possível na API
  existsInSqlite: boolean; // Novo campo para indicar se o usuário existe no SQLite
  isCreating?: boolean; // Novo campo para controlar o estado de criação
}

const ITEMS_PER_PAGE = 10;

export default function GerenciaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [editStates, setEditStates] = useState<Record<string, { comissao: string; password: string; showPassword: boolean; loading: boolean; editingPassword: boolean }>>({});
  const [creatingUsers, setCreatingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Erro ao carregar usuários');
        const data = await response.json();
        setUsers(data);
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

  const handleStartCreate = (codigo: string) => {
    setCreatingUsers(prev => ({ ...prev, [codigo]: true }));
    setEditStates((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        editingPassword: true,
        password: '',
        showPassword: false,
        comissao: '0.00'
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
    setCreatingUsers(prev => ({ ...prev, [codigo]: false }));
  };

  const handleUpdate = async (codigo: string) => {
    setEditStates((prev) => ({ ...prev, [codigo]: { ...prev[codigo], loading: true } }));
    try {
      const { comissao, password, editingPassword } = editStates[codigo];
      const user = users.find(u => u.USUARIO === codigo);
      const body: any = { comissao: comissao ? parseFloat(comissao).toFixed(2) : "0.00" };

      if (editingPassword && password) {
        body.password = password;
      }

      // Se estiver criando um novo usuário, incluir o nome
      if (!user?.existsInSqlite) {
        body.nome = user?.NOME;
      }

      const response = await fetch(`/api/users?codigo=${codigo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao atualizar dados do usuário.' }));
        throw new Error(errorData.message || 'Erro ao atualizar dados');
      }
      toast({
        title: 'Sucesso!',
        description: user?.existsInSqlite ? 'Dados do usuário atualizados.' : 'Usuário criado com sucesso.',
        variant: 'default',
        className: "bg-green-500 dark:bg-green-700 text-white"
      });
      setUsers((prevUsers) => prevUsers.map((u) => u.USUARIO === codigo ? { ...u, COMISSAO: body.comissao, existsInSqlite: true } : u));
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
      setCreatingUsers(prev => ({ ...prev, [codigo]: false }));
    } catch (error: any) {
      toast({
        title: 'Erro ao Atualizar',
        description: error.message || 'Não foi possível atualizar os dados. Tente novamente.',
        variant: 'destructive',
      });
      setEditStates((prev) => ({ ...prev, [codigo]: { ...prev[codigo], loading: false } }));
    }
  };

  // Formata visualmente o valor da comissão para exibição, mas o estado mantém o valor bruto
  const formatComissaoForDisplay = (value: string) => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(2); // Mantém duas casas decimais
  };


  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Melhorando o container principal */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Gerência de Usuários</h1>
          <p className="mt-2 text-lg text-muted-foreground">Edite comissões e senhas diretamente na lista abaixo.</p>
        </div>

        <Card className="shadow-xl border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 px-6 py-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Lista de Usuários</CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Ajuste a comissão (%) e altere senhas conforme necessário.
                    </CardDescription>
                </div>
                <div className="mt-4 sm:mt-0 relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary dark:focus:ring-offset-gray-900 rounded-md h-11"
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0"> {/* Removido pt-6 para tabela começar logo abaixo do header (se preferir) ou ajuste conforme necessário */}
            <div className="overflow-x-auto rounded-b-lg"> {/* Aplicando rounded no wrapper da tabela também */}
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 tracking-wider">Código</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 tracking-wider">Comissão</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 tracking-wider">Senha</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin inline mr-3" /> Carregando usuários...
                      </td>
                    </tr>
                  ) : currentUsersOnPage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Nenhum usuário encontrado com o termo buscado.' : 'Nenhum usuário cadastrado.'}
                      </td>
                    </tr>
                  ) : (
                    currentUsersOnPage.map((user) => (
                      <tr key={user.USUARIO} className="hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">{user.USUARIO}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.NOME}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={editStates[user.USUARIO]?.comissao ?? ''}
                              onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                      handleFieldChange(user.USUARIO, 'comissao', val)
                                  }
                              }}
                              onBlur={(e) => {
                                const formattedValue = formatComissaoForDisplay(e.target.value);
                                handleFieldChange(user.USUARIO, 'comissao', formattedValue);
                              }}
                              className="w-24 h-9 text-right pr-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
                              disabled={editStates[user.USUARIO]?.loading || !user.existsInSqlite}
                              placeholder="0.00"
                            />
                            <Percent className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.existsInSqlite ? (
                            editStates[user.USUARIO]?.editingPassword ? (
                              <div className="relative flex items-center max-w-xs">
                                <Input
                                  type={editStates[user.USUARIO]?.showPassword ? 'text' : 'password'}
                                  value={editStates[user.USUARIO]?.password ?? ''}
                                  onChange={(e) => handleFieldChange(user.USUARIO, 'password', e.target.value)}
                                  className="h-9 pr-20 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
                                  placeholder="Nova senha"
                                  disabled={editStates[user.USUARIO]?.loading}
                                  aria-label="Campo para nova senha"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8"
                                  onClick={() => handleToggleShowPassword(user.USUARIO)}
                                  tabIndex={-1}
                                  title={editStates[user.USUARIO]?.showPassword ? "Ocultar senha" : "Mostrar senha"}
                                  disabled={editStates[user.USUARIO]?.loading}
                                >
                                  {editStates[user.USUARIO]?.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 h-8 w-8"
                                  onClick={() => handleCancelEditPassword(user.USUARIO)}
                                  tabIndex={-1}
                                  title="Cancelar alteração de senha"
                                  disabled={editStates[user.USUARIO]?.loading}
                                >
                                  <XCircle size={18} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                                onClick={() => handleEditPassword(user.USUARIO)}
                                disabled={editStates[user.USUARIO]?.loading}
                                title="Clique para alterar a senha deste usuário"
                              >
                                <Edit3 size={16} /> Alterar Senha
                              </Button>
                            )
                          ) : creatingUsers[user.USUARIO] ? (
                            <div className="relative flex items-center max-w-xs">
                              <Input
                                type={editStates[user.USUARIO]?.showPassword ? 'text' : 'password'}
                                value={editStates[user.USUARIO]?.password ?? ''}
                                onChange={(e) => handleFieldChange(user.USUARIO, 'password', e.target.value)}
                                className="h-9 pr-20 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary"
                                placeholder="Digite a senha inicial"
                                disabled={editStates[user.USUARIO]?.loading}
                                aria-label="Campo para senha inicial"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8"
                                onClick={() => handleToggleShowPassword(user.USUARIO)}
                                tabIndex={-1}
                                title={editStates[user.USUARIO]?.showPassword ? "Ocultar senha" : "Mostrar senha"}
                                disabled={editStates[user.USUARIO]?.loading}
                              >
                                {editStates[user.USUARIO]?.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 h-8 w-8"
                                onClick={() => handleCancelEditPassword(user.USUARIO)}
                                tabIndex={-1}
                                title="Cancelar criação de usuário"
                                disabled={editStates[user.USUARIO]?.loading}
                              >
                                <XCircle size={18} />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!user.existsInSqlite ? (
                            creatingUsers[user.USUARIO] ? (
                              <Button
                                onClick={() => handleUpdate(user.USUARIO)}
                                disabled={!editStates[user.USUARIO]?.password}
                                size="sm"
                                className="flex items-center justify-center gap-2 w-32 h-9 transition-all duration-150 ease-in-out group bg-green-600 hover:bg-green-700 text-white"
                                title="Confirmar criação do usuário"
                              >
                                {editStates[user.USUARIO]?.loading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Criando...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4" />
                                    Confirmar
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleStartCreate(user.USUARIO)}
                                size="sm"
                                className="flex items-center justify-center gap-2 w-32 h-9 transition-all duration-150 ease-in-out group bg-green-600 hover:bg-green-700 text-white"
                                title="Criar usuário no sistema"
                              >
                                <Save className="h-4 w-4" />
                                Criar Usuário
                              </Button>
                            )
                          ) : (
                            <Button
                              onClick={() => handleUpdate(user.USUARIO)}
                              disabled={
                                editStates[user.USUARIO]?.loading ||
                                (
                                  !editStates[user.USUARIO]?.editingPassword &&
                                  (editStates[user.USUARIO]?.comissao === (users.find(u => u.USUARIO === user.USUARIO)?.COMISSAO || '')) &&
                                  !editStates[user.USUARIO]?.password
                                )
                              }
                              size="sm"
                              className="flex items-center justify-center gap-2 w-32 h-9 transition-all duration-150 ease-in-out group"
                              title={editStates[user.USUARIO]?.loading ? 'Salvando alterações...' : 'Salvar alterações'}
                            >
                              {editStates[user.USUARIO]?.loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 transition-transform duration-150 ease-in-out group-hover:scale-110" />
                                  Atualizar
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filteredUsers.length > 0 && (
              <div className="mt-6 px-6 pb-5 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                  Mostrando <span className="font-medium">{Math.min(indexOfFirstItem + 1, filteredUsers.length)}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredUsers.length)}</span> de <span className="font-medium">{filteredUsers.length}</span> usuários
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 h-9 w-9"
                    title="Página anterior"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0} // Adicionado totalPages === 0
                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 h-9 w-9"
                    title="Próxima página"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
             {!loading && filteredUsers.length === 0 && searchTerm && (
                <div className="mt-6 px-6 pb-5 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                    Nenhum usuário encontrado para "{searchTerm}". Tente uma busca diferente.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}