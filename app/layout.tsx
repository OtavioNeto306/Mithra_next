/**
 * Layout principal da aplicação
 * Este arquivo define a estrutura base do aplicativo, incluindo:
 * - Configuração de fonte
 * - Metadados da aplicação
 * - Provedores globais (Tema e Autenticação)
 * - Configuração de notificações toast
 */

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

// Configuração da fonte Inter do Google Fonts
// A fonte é otimizada para carregamento rápido e boa legibilidade
const inter = Inter({ subsets: ["latin"] })

// Metadados da aplicação
// Estes dados são usados para SEO e compartilhamento em redes sociais
export const metadata: Metadata = {
  title: "Sistema de Gestão de Pedidos",
  description: "Sistema web para gestão de pedidos e comissões",
  generator: 'v0.dev'
}

/**
 * Componente RootLayout
 * @param children - Componentes filhos que serão renderizados dentro do layout
 * 
 * Este componente:
 * 1. Define a estrutura HTML base
 * 2. Configura o idioma para português
 * 3. Suprime avisos de hidratação para melhor performance
 * 4. Aplica a fonte Inter
 * 5. Configura o provedor de tema (claro/escuro)
 * 6. Configura o provedor de autenticação
 * 7. Adiciona o sistema de notificações toast
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      <head>
        {/* Define o esquema de cores padrão para o navegador */}
        <meta name="color-scheme" content="light" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* Provedor de tema - Gerencia o tema claro/escuro */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {/* Provedor de autenticação - Gerencia o estado de autenticação */}
          <AuthProvider>
            {children}
            {/* Sistema de notificações toast */}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
