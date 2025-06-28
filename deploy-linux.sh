#!/bin/bash

# 🚀 Script de Deploy Automático - Mithra Next.js com PM2
# Para Linux/Mac

echo "🚀 Iniciando deploy do Projeto Mithra com PM2..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script na pasta raiz do projeto.${NC}"
    exit 1
fi

# Verificar Node.js
echo -e "${YELLOW}🔍 Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js encontrado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js primeiro.${NC}"
    exit 1
fi

# Verificar PM2
echo -e "${YELLOW}🔍 Verificando PM2...${NC}"
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✅ PM2 encontrado: $PM2_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️ PM2 não encontrado. Instalando...${NC}"
    npm install -g pm2
fi

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${CYAN}📦 Usando pnpm...${NC}"
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠️ pnpm não encontrado. Instalando...${NC}"
        npm install -g pnpm
    fi
    pnpm install
else
    echo -e "${CYAN}📦 Usando npm...${NC}"
    npm install
fi

# Build do projeto
echo -e "${YELLOW}🏗️ Fazendo build do projeto...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    pnpm build
else
    npm run build
fi

# Criar pasta de logs se não existir
if [ ! -d "logs" ]; then
    echo -e "${YELLOW}📁 Criando pasta de logs...${NC}"
    mkdir -p logs
fi

# Obter caminho atual
CURRENT_PATH=$(pwd)
echo -e "${CYAN}📍 Caminho do projeto: $CURRENT_PATH${NC}"

# Verificar se ecosystem.config.js existe
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${YELLOW}⚠️ ecosystem.config.js não encontrado. Criando...${NC}"
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'mithra-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '$CURRENT_PATH',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      log_file: '$CURRENT_PATH/logs/combined.log',
      out_file: '$CURRENT_PATH/logs/out.log',
      error_file: '$CURRENT_PATH/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true
    }
  ]
};
EOF
    
    echo -e "${GREEN}✅ ecosystem.config.js criado!${NC}"
else
    echo -e "${GREEN}✅ ecosystem.config.js encontrado!${NC}"
fi

# Parar processo existente (se houver)
echo -e "${YELLOW}🛑 Parando processos PM2 existentes...${NC}"
pm2 delete mithra-next 2>/dev/null || true

# Iniciar com PM2
echo -e "${YELLOW}🚀 Iniciando aplicação com PM2...${NC}"
pm2 start ecosystem.config.js

# Salvar configuração
echo -e "${YELLOW}💾 Salvando configuração PM2...${NC}"
pm2 save

# Verificar status
echo -e "${YELLOW}📊 Status da aplicação:${NC}"
pm2 status

# Obter IP do servidor
echo -e "${YELLOW}🌐 Informações de acesso:${NC}"
IP_ADDRESS=$(hostname -I | awk '{print $1}' 2>/dev/null || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)

if [ ! -z "$IP_ADDRESS" ]; then
    echo -e "${GREEN}✅ Aplicação rodando em:${NC}"
    echo -e "${CYAN}   Local: http://localhost:3000${NC}"
    echo -e "${CYAN}   Rede:  http://$IP_ADDRESS:3000${NC}"
else
    echo -e "${GREEN}✅ Aplicação rodando em:${NC}"
    echo -e "${CYAN}   Local: http://localhost:3000${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos úteis:${NC}"
echo -e "${CYAN}   pm2 status          - Ver status${NC}"
echo -e "${CYAN}   pm2 logs mithra-next - Ver logs${NC}"
echo -e "${CYAN}   pm2 restart mithra-next - Reiniciar${NC}"
echo -e "${CYAN}   pm2 stop mithra-next - Parar${NC}"

# Configurar startup automático (opcional)
echo ""
echo -e "${YELLOW}💡 Para configurar inicialização automática, execute:${NC}"
echo -e "${CYAN}   pm2 startup${NC}"
echo -e "${CYAN}   # Siga as instruções que aparecerem${NC}" 