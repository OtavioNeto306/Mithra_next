"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Tipo para o usuário
interface User {
  id: string
  usuario: string
  nome: string
  email?: string
  permissoes: {
    checkin: boolean
    rotas: boolean
    dashboard: boolean
    metas: boolean
    pedidos: boolean
    produtos: boolean
    prospects: boolean
    vendedores: boolean
    configuracoes: boolean
    gerencia: boolean
  }
}

// Tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Criando o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}



// Componente Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verificar se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // Função de login
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: username,
          senha: password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(data.user))
        return true
      } else {
        const error = await response.json()
        console.error('Erro no login:', error.error)
        return false
      }
    } catch (error) {
      console.error('Erro na requisição de login:', error)
      return false
    }
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  // Valor do contexto
  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
