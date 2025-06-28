# Sistema de Gerenciamento de Pedidos Web

## 📋 Visão Geral
Sistema de gerenciamento de pedidos desenvolvido com Next.js, TypeScript e SQLite, oferecendo uma interface moderna e responsiva para gerenciamento de pedidos, usuários e configurações.

## 🚀 Tecnologias Principais
- Next.js 15.2.4
- React 19
- TypeScript
- SQLite
- TailwindCSS
- Radix UI Components
- React Hook Form
- Zod (Validação)

## 🛠️ Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou pnpm
- SQLite3

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```env
DATABASE_URL=file:./usuarios.db3
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000
```

4. Execute as migrações do banco de dados:
```bash
npm run migrate
# ou
pnpm migrate
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
pnpm dev
```

## 📁 Estrutura do Projeto

```
├── app/                    # Diretório principal da aplicação
│   ├── api/               # Endpoints da API
│   ├── dashboard/         # Páginas do dashboard
│   ├── login/            # Páginas de autenticação
│   └── ...
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
├── hooks/                # Custom hooks
├── public/               # Arquivos estáticos
└── styles/              # Estilos globais
```

## 🔒 APIs

### Autenticação
- `POST /api/users/login`
  - Autenticação de usuários
  - Body: `{ email: string, password: string }`
  - Retorna: Token JWT e dados do usuário

### Usuários
- `GET /api/users`
  - Lista todos os usuários
  - Requer autenticação
  - Retorna: Array de usuários

- `POST /api/users`
  - Cria novo usuário
  - Body: `{ name: string, email: string, password: string, role: string }`
  - Retorna: Usuário criado

### Vendedores
- `GET /api/vendedores`
  - Lista todos os vendedores
  - Requer autenticação
  - Retorna: Array de vendedores

### Configurações
- `GET /api/configuracoes`
  - Obtém configurações do sistema
  - Requer autenticação
  - Retorna: Objeto com configurações

## 🔄 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run migrate` - Executa migrações do banco de dados

## 🧪 Testes
Para executar os testes:
```bash
npm run test
```

## 📦 Deploy
O projeto está configurado para deploy automático na Vercel.

## 🤝 Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores
- Seu Nome - Desenvolvimento inicial

## 📞 Suporte
Para suporte, envie um email para [seu-email@exemplo.com]