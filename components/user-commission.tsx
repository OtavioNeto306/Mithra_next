'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface UserCommissionProps {
  codigo: string;
}

export function UserCommission({ codigo }: UserCommissionProps) {
  const [comissao, setComissao] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar dados do usuário
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`/api/users?codigo=${codigo}`);
        if (!response.ok) throw new Error('Erro ao carregar usuário');
        const user = await response.json();
        // Garante que o valor seja uma string
        setComissao(typeof user.COMISSAO === 'string' ? user.COMISSAO : '');
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do usuário',
          variant: 'destructive',
        });
        // Em caso de erro, garante que o valor seja uma string vazia
        setComissao('');
      }
    }
    loadUser();
  }, [codigo, toast]);

  // Atualizar comissão
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users?codigo=${codigo}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comissao: String(comissao) }), // Garante que seja uma string
      });

      if (!response.ok) throw new Error('Erro ao atualizar comissão');

      toast({
        title: 'Sucesso',
        description: 'Comissão atualizada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a comissão',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Garante que o valor nunca seja nulo
  const safeComissao = typeof comissao === 'string' ? comissao : '';

  return (
    <div className="flex items-center gap-4">
      <Input
        type="text"
        value={safeComissao}
        onChange={(e) => setComissao(e.target.value || '')}
        placeholder="Digite a comissão"
        className="w-32"
      />
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar'}
      </Button>
    </div>
  );
} 