# Documentação das APIs

## Visão Geral
O sistema utiliza uma arquitetura REST com Next.js API Routes. Todas as APIs são tipadas com TypeScript e incluem validação de dados.

## Estrutura de Diretórios

```
app/api/
├── users/           # APIs de usuários
├── vendedores/      # APIs de vendedores
├── configuracoes/   # APIs de configurações
└── test-connection/ # API de teste de conexão
```

## Endpoints

### Usuários

#### GET /api/users
Lista todos os usuários ou busca um usuário específico.

**Query Parameters:**
- `codigo` (opcional): Código do usuário

**Resposta:**
```typescript
interface User {
  USUARIO: string;
  NOME: string;
  COMISSAO: string;
  PASSWORD: string;
  USERNAME: string;
  UACESSO: string;
  BLOQUEADO: number;
  existsInSqlite: boolean;
}
```

**Status:**
- 200: Sucesso
- 404: Usuário não encontrado
- 500: Erro interno

#### PATCH /api/users
Atualiza dados do usuário.

**Query Parameters:**
- `codigo` (obrigatório): Código do usuário

**Body:**
```typescript
{
  comissao?: string;
  password?: string;
  nome?: string;
}
```

**Resposta:**
```typescript
{
  message: string;
  error?: string;
}
```

**Status:**
- 200: Sucesso
- 400: Dados inválidos
- 500: Erro interno

### Vendedores

#### GET /api/vendedores
Lista todos os vendedores.

**Resposta:**
```typescript
interface Vendedor {
  CODI_PES: number;
  NOME_PES: string;
  // outros campos
}
```

**Status:**
- 200: Sucesso
- 500: Erro interno

### Configurações

#### GET /api/configuracoes
Obtém configurações do sistema.

**Resposta:**
```typescript
interface Configuracoes {
  // campos de configuração
}
```

**Status:**
- 200: Sucesso
- 500: Erro interno

## Autenticação

Todas as APIs (exceto login) requerem autenticação via JWT.

**Header:**
```
Authorization: Bearer <token>
```

## Validação

As APIs utilizam Zod para validação de dados:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  comissao: z.string().optional(),
  password: z.string().min(6).optional(),
  nome: z.string().optional()
});
```

## Tratamento de Erros

Erros são padronizados:

```typescript
interface ApiError {
  error: string;
  details?: any;
}
```

## Boas Práticas

1. **Segurança**
   - Validação de inputs
   - Sanitização de dados
   - Rate limiting
   - CORS configurado

2. **Performance**
   - Cache quando apropriado
   - Paginação de resultados
   - Otimização de queries

3. **Manutenção**
   - Código tipado
   - Documentação clara
   - Logs estruturados

## Exemplos de Uso

### Listar Usuários
```typescript
const response = await fetch('/api/users');
const users = await response.json();
```

### Atualizar Usuário
```typescript
const response = await fetch('/api/users?codigo=123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    comissao: '10.00',
    password: 'novasenha'
  })
});
```

## Troubleshooting

### Problemas Comuns

1. **Erro 401 (Unauthorized)**
   - Verifique token
   - Confirme expiração
   - Valide formato

2. **Erro 400 (Bad Request)**
   - Verifique payload
   - Confirme tipos
   - Valide schema

3. **Erro 500 (Internal Server Error)**
   - Verifique logs
   - Confirme conexão DB
   - Valide ambiente

## Monitoramento

- Logs de erro
- Métricas de performance
- Alertas configurados

## Contribuição

1. Siga padrões de código
2. Documente novas APIs
3. Adicione testes
4. Mantenha tipagem 