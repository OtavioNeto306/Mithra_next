# Script de Migração do Projeto Mithra Next
# Uso: .\migrate.ps1 "C:\novo\caminho\destino"

param(
    [Parameter(Mandatory=$true)]
    [string]$NovoLocal
)

Write-Host "🚀 Iniciando migração do projeto Mithra Next..." -ForegroundColor Green

# Passo 1: Parar PM2
Write-Host "📋 Parando aplicação PM2..." -ForegroundColor Yellow
try {
    pm2 stop mithra-next
    pm2 delete mithra-next
    Write-Host "✅ PM2 parado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro ao parar PM2 (pode não estar rodando): $_" -ForegroundColor Yellow
}

# Passo 2: Criar diretório de destino
Write-Host "📁 Criando diretório de destino..." -ForegroundColor Yellow
if (!(Test-Path $NovoLocal)) {
    New-Item -ItemType Directory -Force -Path $NovoLocal
    Write-Host "✅ Diretório criado: $NovoLocal" -ForegroundColor Green
} else {
    Write-Host "⚠️  Diretório já existe: $NovoLocal" -ForegroundColor Yellow
}

# Passo 3: Copiar arquivos
Write-Host "📦 Copiando arquivos..." -ForegroundColor Yellow
$LocalAtual = Get-Location
Copy-Item -Path "$LocalAtual\*" -Destination $NovoLocal -Recurse -Force
Write-Host "✅ Arquivos copiados com sucesso" -ForegroundColor Green

# Passo 4: Navegar para novo local
Write-Host "📍 Navegando para novo local..." -ForegroundColor Yellow
Set-Location $NovoLocal

# Passo 5: Reiniciar PM2
Write-Host "🔄 Reiniciando aplicação com PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js
pm2 save

Write-Host "🎉 Migração concluída com sucesso!" -ForegroundColor Green
Write-Host "📍 Novo local: $NovoLocal" -ForegroundColor Cyan
Write-Host "🌐 Aplicação disponível em: http://localhost:3000" -ForegroundColor Cyan

# Passo 6: Verificar status
Write-Host "📊 Status da aplicação:" -ForegroundColor Yellow
pm2 status 