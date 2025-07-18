import { useState, useEffect, useCallback } from 'react';
import { Meta, MetaCreate, MetaUpdate, MetaFilter, MetaResponse } from '@/types/metas';

export function useMetas() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacao, setPaginacao] = useState({
    total: 0,
    pagina: 1,
    limite: 10,
    totalPaginas: 0
  });

  // Buscar metas com filtros
  const fetchMetas = useCallback(async (filtros: MetaFilter = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filtros.codigo_vendedor) params.append('codigo_vendedor', filtros.codigo_vendedor);
      if (filtros.ano) params.append('ano', filtros.ano.toString());
      if (filtros.mes) params.append('mes', filtros.mes.toString());
      if (filtros.tipo_meta) params.append('tipo_meta', filtros.tipo_meta);
      if (filtros.page) params.append('page', filtros.page.toString());
      if (filtros.limit) params.append('limit', filtros.limit.toString());

      const response = await fetch(`/api/metas?${params.toString()}`);
      const data: MetaResponse = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setMetas(data.data);
        if (data.paginacao) {
          setPaginacao(data.paginacao);
        }
      } else {
        setError(data.error || 'Erro ao carregar metas');
        setMetas([]);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      setMetas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova meta
  const createMeta = useCallback(async (meta: MetaCreate): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/metas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meta),
      });

      const data: MetaResponse = await response.json();

      if (data.success) {
        // Recarregar lista de metas
        await fetchMetas();
        return true;
      } else {
        setError(data.error || 'Erro ao criar meta');
        return false;
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMetas]);

  // Atualizar meta existente
  const updateMeta = useCallback(async (id: number, meta: MetaUpdate): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/metas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meta),
      });

      const data: MetaResponse = await response.json();

      if (data.success) {
        // Recarregar lista de metas
        await fetchMetas();
        return true;
      } else {
        setError(data.error || 'Erro ao atualizar meta');
        return false;
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMetas]);

  // Excluir meta
  const deleteMeta = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/metas/${id}`, {
        method: 'DELETE',
      });

      const data: MetaResponse = await response.json();

      if (data.success) {
        // Recarregar lista de metas
        await fetchMetas();
        return true;
      } else {
        setError(data.error || 'Erro ao excluir meta');
        return false;
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMetas]);

  // Buscar meta específica
  const fetchMeta = useCallback(async (id: number): Promise<Meta | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/metas/${id}`);
      const data: MetaResponse = await response.json();

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data.data;
      } else {
        setError(data.error || 'Erro ao carregar meta');
        return null;
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar metas de um vendedor específico
  const fetchMetasVendedor = useCallback(async (codigoVendedor: string): Promise<Meta[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/metas/vendedor/${codigoVendedor}`);
      const data: MetaResponse = await response.json();

      if (data.success && Array.isArray(data.data)) {
        return data.data;
      } else {
        setError(data.error || 'Erro ao carregar metas do vendedor');
        return [];
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar metas iniciais
  useEffect(() => {
    fetchMetas();
  }, [fetchMetas]);

  return {
    metas,
    loading,
    error,
    paginacao,
    fetchMetas,
    createMeta,
    updateMeta,
    deleteMeta,
    fetchMeta,
    fetchMetasVendedor,
    setError,
  };
} 