"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Tipo para o usuário
interface User {
  id: string
  name: string
  role: string
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

// Usuário mockado para teste
const MOCK_USER: User = {
  id: "1",
  name: "Administrador",
  role: "admin",
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
    // Simulando validação de credenciais
    // Em um caso real, isso seria uma chamada à API
    if (username === "admin" && password === "admin") {
      setUser(MOCK_USER)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(MOCK_USER))
      return true
    }
    return false
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
