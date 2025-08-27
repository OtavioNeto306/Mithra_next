import { useState, useCallback } from 'react'

interface Prospect {
  CGC: string
  DATA: string
  HORA: string
  LATITUDE: string
  LONGITUDE: string
  NOME: string
  DTNASC: string
  INSCRI: string
  TELEFONE: string
  CIDADE: string
  ESTADO: string
  SEGMENTO: string
  EMAIL: string
  ANIMAL: string
  TECNICO: string
}

interface Tecnico {
  id: string
  nome: string
}

interface FetchProspectsParams {
  search?: string
  dataInicio?: string
  dataFim?: string
  tecnico?: string
}

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProspects = useCallback(async (params: FetchProspectsParams = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams()
      
      if (params.search) queryParams.append('search', params.search)
      if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio)
      if (params.dataFim) queryParams.append('dataFim', params.dataFim)
      if (params.tecnico) queryParams.append('tecnico', params.tecnico)
      
      const response = await fetch(`/api/prospects?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setProspects(data.prospects || [])
      
      // Se não temos técnicos carregados, carregar da resposta
      if (data.tecnicos && tecnicos.length === 0) {
        setTecnicos(data.tecnicos)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar prospects:', err)
    } finally {
      setLoading(false)
    }
  }, [tecnicos.length])

  const fetchTecnicos = useCallback(async () => {
    try {
      const response = await fetch('/api/prospects/tecnicos')
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setTecnicos(data.tecnicos || [])
    } catch (err) {
      console.error('Erro ao buscar técnicos:', err)
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchProspects()
  }, [fetchProspects])

  return {
    prospects,
    tecnicos,
    loading,
    error,
    fetchProspects,
    fetchTecnicos,
    refetch
  }
}