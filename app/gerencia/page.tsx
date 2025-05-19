"use client"

import { useState, useEffect } from 'react';
import { UserCommission } from '@/components/user-commission';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  USUARIO: string;
  NOME: string;
  USERNAME: string;
  UACESSO: string;
  BLOQUEADO: number;
  COMISSAO: string;
}

export default function GerenciaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar usuários
  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Erro ao carregar usuários');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os usuários',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [toast]);

  // Filtrar usuários
  const filteredUsers = users.filter(user => 
    user.NOME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.USUARIO.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerência de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div>Carregando...</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.USUARIO}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="font-medium">{user.NOME}</h3>
                    <p className="text-sm text-gray-500">Código: {user.USUARIO}</p>
                  </div>
                  <UserCommission codigo={user.USUARIO} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
