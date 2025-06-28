# 🚀 Script de Deploy Automático - Mithra Next.js com PM2
# Para Windows PowerShell

Write-Host "🚀 Iniciando deploy do Projeto Mithra com PM2..." -ForegroundColor Green

# Verificar se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado. Execute este script na pasta raiz do projeto." -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar PM2
Write-Host "🔍 Verificando PM2..." -ForegroundColor Yellow
try {
    $pm2Version = pm2 --version
    Write-Host "✅ PM2 encontrado: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PM2 não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pm2
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
if (Test-Path "pnpm-lock.yaml") {
    Write-Host "📦 Usando pnpm..." -ForegroundColor Cyan
    pnpm install
} else {
    Write-Host "📦 Usando npm..." -ForegroundColor Cyan
    npm install
}

# Build do projeto
Write-Host "🏗️ Fazendo build do projeto..." -ForegroundColor Yellow
if (Test-Path "pnpm-lock.yaml") {
    pnpm build
} else {
    npm run build
}

# Criar pasta de logs se não existir
if (-not (Test-Path "logs")) {
    Write-Host "📁 Criando pasta de logs..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "logs"
}

# Obter caminho atual
$currentPath = (Get-Location).Path
Write-Host "📍 Caminho do projeto: $currentPath" -ForegroundColor Cyan

# Verificar se ecosystem.config.js existe
if (-not (Test-Path "ecosystem.config.js")) {
    Write-Host "⚠️ ecosystem.config.js não encontrado. Criando..." -ForegroundColor Yellow
    
    $ecosystemContent = @"
module.exports = {
  apps: [
    {
      name: 'mithra-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '$($currentPath.Replace('\', '\\'))',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      log_file: '$($currentPath.Replace('\', '\\'))\\logs\\combined.log',
      out_file: '$($currentPath.Replace('\', '\\'))\\logs\\out.log',
      error_file: '$($currentPath.Replace('\', '\\'))\\logs\\error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true
    }
  ]
};
"@
    
    $ecosystemContent | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8
    Write-Host "✅ ecosystem.config.js criado!" -ForegroundColor Green
} else {
    Write-Host "✅ ecosystem.config.js encontrado!" -ForegroundColor Green
}

# Parar processo existente (se houver)
Write-Host "🛑 Parando processos PM2 existentes..." -ForegroundColor Yellow
pm2 delete mithra-next 2>$null

# Iniciar com PM2
Write-Host "🚀 Iniciando aplicação com PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

# Salvar configuração
Write-Host "💾 Salvando configuração PM2..." -ForegroundColor Yellow
pm2 save

# Verificar status
Write-Host "📊 Status da aplicação:" -ForegroundColor Yellow
pm2 status

# Obter IP do servidor
Write-Host "🌐 Informações de acesso:" -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "✅ Aplicação rodando em:" -ForegroundColor Green
    Write-Host "   Local: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Rede:  http://$ipAddress`:3000" -ForegroundColor Cyan
} else {
    Write-Host "✅ Aplicação rodando em:" -ForegroundColor Green
    Write-Host "   Local: http://localhost:3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Yellow
Write-Host "   pm2 status          - Ver status" -ForegroundColor Cyan
Write-Host "   pm2 logs mithra-next - Ver logs" -ForegroundColor Cyan
Write-Host "   pm2 restart mithra-next - Reiniciar" -ForegroundColor Cyan
Write-Host "   pm2 stop mithra-next - Parar" -ForegroundColor Cyan 