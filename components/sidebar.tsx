"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  X,
  ShoppingCart,
  Package,
  MapPin,
  Target,
  Building2,
  BarChart3,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

interface SidebarProps {
  onClose: () => void
  onLogout: () => void
}

export function Sidebar({ onClose, onLogout }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  // Função para filtrar itens baseado nas permissões do usuário
  const getFilteredNavItems = () => {
    if (!user) return []

    const allNavItems = [
      {
        group: "Principal",
        items: [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            description: "Visão geral do sistema",
            permission: "dashboard"
          }
        ]
      },
      {
        group: "Gestão Comercial",
        items: [
          {
            name: "Orçamentos",
            href: "/pedidos",
            icon: ShoppingCart,
            description: "Gerenciar orçamentos",
            permission: "pedidos"
          },
          {
            name: "Produtos",
            href: "/produtos",
            icon: Package,
            description: "Catálogo de produtos",
            permission: "produtos"
          }
        ]
      },
      {
        group: "Gestão de Equipe",
        items: [
          {
            name: "Metas de Vendedores",
            href: "/metas",
            icon: Target,
            description: "Definir metas mensais",
            permission: "metas"
          },
          {
            name: "Relatório de Checkin",
            href: "/checkin",
            icon: MapPin,
            description: "Controle de presença",
            permission: "checkin"
          },
          {
            name: "Gerência de Comissões",
            href: "/gerencia",
            icon: UserCheck,
            description: "Gestão de comissões",
            permission: "gerencia"
          },
          {
            name: "Rotas",
            href: "/rotas",
            icon: MapPin,
            description: "Visualização de rotas de vendas",
            permission: "rotas"
          }
        ]
      },
      {
        group: "Sistema",
        items: [
          {
            name: "Usuários",
            href: "/usuarios",
            icon: Users,
            description: "Gerenciar usuários e permissões",
            permission: "vendedores"
          },
          {
            name: "Configurações",
            href: "/configuracoes",
            icon: Settings,
            description: "Configurações do sistema",
            permission: "configuracoes"
          }
        ]
      }
    ]

    // Filtrar grupos e itens baseado nas permissões
    return allNavItems.map(group => ({
      ...group,
      items: group.items.filter(item => 
        user.permissoes[item.permission as keyof typeof user.permissoes]
      )
    })).filter(group => group.items.length > 0)
  }

  const navItems = getFilteredNavItems()

  // Função para navegar para uma rota
  const navigateTo = (path: string) => {
    router.push(path)
    onClose() // Fechar o menu em dispositivos móveis após a navegação
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mithra</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gestão de Orçamentos</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 px-4 py-6">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-2">
            <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12 px-3 transition-all duration-200",
                      isActive
                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    )}
                    onClick={() => navigateTo(item.href)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                    )} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.name}</span>
                      <span className={cn(
                        "text-xs transition-colors",
                        isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {item.description}
                      </span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 px-3 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <div className="flex flex-col items-start">
            <span className="font-medium">Sair</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Encerrar sessão</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
