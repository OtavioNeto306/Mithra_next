# 🚀 Deploy do Projeto Mithra com PM2 - Passo a Passo

## 📋 Pré-requisitos

Antes de começar, certifique-se de que o servidor tem:
- ✅ Node.js (versão 18 ou superior)
- ✅ npm ou pnpm
- ✅ PM2 instalado globalmente
- ✅ Git (para clonar o projeto)

---

## 🔧 Passo 1: Preparação do Ambiente

### 1.1 Instalar Node.js (se não estiver instalado)
```bash
# Windows - baixar do site oficial: https://nodejs.org
# Linux Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 1.2 Instalar PM2 globalmente
```bash
npm install -g pm2
```

### 1.3 Instalar pnpm (se usar pnpm)
```bash
npm install -g pnpm
```

---

## 📁 Passo 2: Obter o Projeto

### 2.1 Clonar o repositório (se estiver no Git)
```bash
git clone [URL_DO_REPOSITORIO]
cd Mithra_next
```

### 2.2 OU copiar arquivos manualmente
- Copie toda a pasta do projeto para o servidor
- Navegue até a pasta do projeto

---

## 📦 Passo 3: Instalar Dependências

```bash
# Se usar npm:
npm install

# Se usar pnpm:
pnpm install
```

---

## 🏗️ Passo 4: Build do Projeto

```bash
# Se usar npm:
npm run build

# Se usar pnpm:
pnpm build
```

---

## ⚙️ Passo 5: Configurar o PM2

### 5.1 Ajustar o arquivo ecosystem.config.js

Edite o arquivo `ecosystem.config.js` e ajuste o caminho `cwd` para o caminho correto no novo servidor:

```javascript
module.exports = {
  apps: [
    {
      name: 'mithra-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/caminho/completo/para/o/projeto', // ⚠️ AJUSTAR ESTE CAMINHO
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0' // Para permitir acesso externo
      },
      log_file: '/caminho/completo/para/o/projeto/logs/combined.log', // ⚠️ AJUSTAR
      out_file: '/caminho/completo/para/o/projeto/logs/out.log',     // ⚠️ AJUSTAR
      error_file: '/caminho/completo/para/o/projeto/logs/error.log', // ⚠️ AJUSTAR
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      merge_logs: true
    }
  ]
};
```

### 5.2 Criar pasta de logs (se não existir)
```bash
mkdir -p logs
```

---

## 🚀 Passo 6: Iniciar o Serviço

### 6.1 Iniciar com PM2
```bash
pm2 start ecosystem.config.js
```

### 6.2 Verificar status
```bash
pm2 status
pm2 logs mithra-next
```

### 6.3 Salvar configuração
```bash
pm2 save
```

### 6.4 Configurar inicialização automática
```bash
pm2 startup
# Seguir as instruções que aparecerem na tela
```

---

## 🌐 Passo 7: Verificar Acesso

### 7.1 Descobrir IP do servidor
```bash
# Windows:
ipconfig

# Linux:
ip addr show
# ou
hostname -I
```

### 7.2 Testar acesso
- Local: `http://localhost:3000`
- Rede: `http://[IP_DO_SERVIDOR]:3000`

---

## 🔧 Comandos Úteis do PM2

### Gerenciamento básico:
```bash
pm2 list                    # Listar processos
pm2 status                  # Status detalhado
pm2 restart mithra-next     # Reiniciar aplicação
pm2 stop mithra-next        # Parar aplicação
pm2 delete mithra-next      # Remover aplicação
```

### Logs:
```bash
pm2 logs mithra-next        # Ver logs em tempo real
pm2 logs mithra-next --lines 100  # Ver últimas 100 linhas
pm2 flush                   # Limpar logs
```

### Monitoramento:
```bash
pm2 monit                   # Monitor em tempo real
pm2 show mithra-next        # Detalhes da aplicação
```

---

## 🔒 Configurações de Segurança (Opcional)

### Firewall (Linux):
```bash
# Permitir apenas porta 3000
sudo ufw allow 3000
sudo ufw enable
```

### Proxy Reverso com Nginx (Opcional):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🆘 Solução de Problemas

### Problema: Aplicação não inicia
```bash
# Verificar logs
pm2 logs mithra-next

# Verificar se a porta está em uso
netstat -tulpn | grep :3000

# Reiniciar com variáveis atualizadas
pm2 restart mithra-next --update-env
```

### Problema: Não consegue acessar externamente
- Verificar se `HOST: '0.0.0.0'` está configurado
- Verificar firewall
- Verificar se a porta 3000 está liberada

### Problema: Erro de permissões
```bash
# Dar permissões corretas
chmod -R 755 /caminho/para/o/projeto
chown -R usuario:grupo /caminho/para/o/projeto
```

---

## 📝 Checklist Final

- [ ] Node.js instalado
- [ ] PM2 instalado globalmente
- [ ] Dependências instaladas (`npm install` ou `pnpm install`)
- [ ] Projeto buildado (`npm run build` ou `pnpm build`)
- [ ] Arquivo `ecosystem.config.js` ajustado com caminhos corretos
- [ ] Pasta `logs` criada
- [ ] PM2 iniciado (`pm2 start ecosystem.config.js`)
- [ ] Configuração salva (`pm2 save`)
- [ ] Startup configurado (`pm2 startup`)
- [ ] Acesso testado (local e rede)

---

## 🎯 Comandos Resumidos para Deploy Rápido

```bash
# 1. Navegar para o projeto
cd /caminho/para/Mithra_next

# 2. Instalar dependências
npm install  # ou pnpm install

# 3. Build
npm run build  # ou pnpm build

# 4. Ajustar ecosystem.config.js (caminhos)

# 5. Iniciar PM2
pm2 start ecosystem.config.js

# 6. Salvar e configurar startup
pm2 save
pm2 startup

# 7. Verificar
pm2 status
```

---

**✅ Pronto! Seu projeto Mithra está rodando com PM2 no novo servidor!** 