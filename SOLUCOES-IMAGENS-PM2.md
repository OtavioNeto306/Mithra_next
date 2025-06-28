# Soluções para Problema de Imagens com Next.js + PM2 no Windows

## 🔍 **PROBLEMA IDENTIFICADO**

O Next.js em modo de produção (`next start`) **só serve arquivos estáticos que existiam no momento do build**. Arquivos adicionados à pasta `public/` após o `npm run build` não são servidos automaticamente, resultando em erro 404.

### Evidências do Diagnóstico:
- ✅ **EML0001.jpg** (criado antes do build): Status 200
- ❌ **EML0002.jpg** (criado após o build): Status 404  
- ❌ **EML0005.webp** (criado após o build): Status 404
- ✅ **placeholder.jpg** (existia antes do build): Status 200

---

## 🛠️ **SOLUÇÕES DISPONÍVEIS**

### **SOLUÇÃO 1: Rebuild Automático (Recomendada)**

Configurar o PM2 para fazer rebuild automático quando novos arquivos são adicionados à pasta `public/img/`.

**Vantagens:**
- ✅ Solução definitiva
- ✅ Mantém otimizações do Next.js
- ✅ Funciona com qualquer formato de imagem

**Implementação:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'mithra-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: 'C:\\Projetos\\Mithra_next',
      instances: 1,
      autorestart: true,
      watch: ['public/img'], // Observar pasta de imagens
      ignore_watch: ['node_modules', '.next', 'logs'],
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        interval: 1000
      },
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      // Script para rebuild quando arquivos mudam
      restart_delay: 2000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### **SOLUÇÃO 2: Servidor de Arquivos Estáticos Separado**

Usar um servidor HTTP simples para servir apenas as imagens.

**Vantagens:**
- ✅ Não requer rebuild
- ✅ Serve imagens imediatamente
- ✅ Baixo overhead

**Implementação:**
```javascript
// servidor-imagens.js
const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos da pasta public/img
app.use('/img', express.static(path.join(__dirname, 'public/img')));

app.listen(3001, () => {
  console.log('Servidor de imagens rodando na porta 3001');
});
```

```javascript
// ecosystem.config.js (adicionar segundo app)
module.exports = {
  apps: [
    {
      name: 'mithra-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      // ... configurações existentes
    },
    {
      name: 'servidor-imagens',
      script: 'servidor-imagens.js',
      cwd: 'C:\\Projetos\\Mithra_next',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### **SOLUÇÃO 3: Proxy Reverso com Express**

Criar um middleware Express que intercepta requests de imagens.

**Implementação:**
```javascript
// server.js
const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Middleware para servir imagens dinâmicas
  server.get('/img/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', 'img', filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Imagem não encontrada');
    }
  });

  // Todas as outras rotas para o Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Servidor rodando na porta 3000');
  });
});
```

### **SOLUÇÃO 4: API Route para Servir Imagens**

Criar uma API route no Next.js para servir as imagens.

**Implementação:**
```typescript
// app/api/img/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filePath = join(process.cwd(), 'public', 'img', filename);

    if (!existsSync(filePath)) {
      return new NextResponse('Imagem não encontrada', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    if (ext === 'webp') contentType = 'image/webp';
    if (ext === 'gif') contentType = 'image/gif';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse('Erro ao carregar imagem', { status: 500 });
  }
}
```

---

## 🚀 **IMPLEMENTAÇÃO RECOMENDADA**

### **Opção A: Solução Rápida (API Route)**
Para implementação imediata sem mudanças no PM2:

1. Criar a API route `/api/img/[filename]/route.ts`
2. Alterar URLs no frontend de `/img/arquivo.jpg` para `/api/img/arquivo.jpg`

### **Opção B: Solução Robusta (Rebuild Automático)**
Para solução definitiva:

1. Atualizar `ecosystem.config.js` com watch na pasta `public/img`
2. Configurar rebuild automático
3. Manter URLs originais `/img/arquivo.jpg`

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### Para API Route:
- [ ] Criar arquivo `app/api/img/[filename]/route.ts`
- [ ] Testar com `curl http://localhost:3000/api/img/EML0005.webp`
- [ ] Atualizar componentes para usar `/api/img/` em vez de `/img/`
- [ ] Verificar cache e performance

### Para Rebuild Automático:
- [ ] Backup do `ecosystem.config.js` atual
- [ ] Atualizar configuração com watch
- [ ] Reiniciar PM2: `pm2 restart mithra-next`
- [ ] Testar upload de nova imagem
- [ ] Verificar logs: `pm2 logs mithra-next`

---

## 🔧 **COMANDOS ÚTEIS**

```bash
# Verificar status do PM2
pm2 list

# Ver logs em tempo real
pm2 logs mithra-next

# Reiniciar aplicação
pm2 restart mithra-next

# Fazer novo build
npm run build

# Testar servidor local
node teste-pm2.js
```

---

## ⚠️ **CONSIDERAÇÕES IMPORTANTES**

1. **Performance**: API routes têm overhead maior que arquivos estáticos
2. **Cache**: Configurar headers de cache adequados
3. **Segurança**: Validar nomes de arquivos para evitar path traversal
4. **Monitoramento**: Acompanhar logs do PM2 após mudanças
5. **Backup**: Sempre fazer backup antes de mudanças em produção 