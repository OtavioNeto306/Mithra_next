"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, LogOut, X, ShoppingCart, Package } from "lucide-react"

interface SidebarProps {
  onClose: () => void
  onLogout: () => void
}

export function Sidebar({ onClose, onLogout }: SidebarProps) {
  const router = useRouter()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Pedidos",
      href: "/pedidos",
      icon: ShoppingCart,
    },
    {
      name: "Produtos",
      href: "/produtos",
      icon: Package,
    },
    {
      name: "Gerência de Comissões",
      href: "/gerencia",
      icon: Users,
    },
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
  ]

  // Função para navegar para uma rota
  const navigateTo = (path: string) => {
    router.push(path)
    onClose() // Fechar o menu em dispositivos móveis após a navegação
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Gestão de Pedidos</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigateTo(item.href)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            <span className="flex-1 truncate">{item.name}</span>
          </Button>
        ))}
      </nav>
      <div className="border-t p-4 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  )
}
