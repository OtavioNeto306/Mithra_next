# Documentação dos Componentes

## Visão Geral
O sistema utiliza uma arquitetura baseada em componentes, com foco em reutilização e manutenibilidade. Os componentes são construídos usando React, TypeScript e TailwindCSS.

## Estrutura de Diretórios

```
components/
├── ui/              # Componentes de UI básicos
├── forms/           # Componentes de formulário
├── layout/          # Componentes de layout
└── shared/          # Componentes compartilhados
```

## Componentes Principais

### Componentes de UI

#### Button
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```
- Botão reutilizável com variantes e tamanhos
- Suporte a temas claro/escuro
- Acessibilidade integrada

#### Input
```typescript
interface InputProps {
  type?: 'text' | 'password' | 'email';
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}
```
- Campo de entrada com validação
- Suporte a labels e mensagens de erro
- Integração com React Hook Form

### Componentes de Layout

#### Sidebar
- Menu lateral responsivo
- Navegação principal
- Suporte a temas

#### Header
- Barra superior com informações do usuário
- Menu de contexto
- Notificações

### Componentes de Formulário

#### UserForm
- Formulário de cadastro/edição de usuários
- Validação com Zod
- Integração com API

#### CommissionForm
- Formulário de comissões
- Cálculos automáticos
- Validação de valores

## Hooks Personalizados

### useAuth
```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```
- Gerenciamento de autenticação
- Persistência de sessão
- Proteção de rotas

### useTheme
```typescript
const { theme, toggleTheme } = useTheme();
```
- Gerenciamento de tema
- Persistência de preferência
- Suporte a tema do sistema

## Boas Práticas

1. **Componentização**
   - Componentes pequenos e focados
   - Props tipadas com TypeScript
   - Documentação de props

2. **Estilização**
   - Uso consistente do TailwindCSS
   - Variáveis CSS para temas
   - Responsividade

3. **Performance**
   - Memoização quando necessário
   - Lazy loading de componentes grandes
   - Otimização de re-renders

4. **Acessibilidade**
   - ARIA labels
   - Navegação por teclado
   - Contraste adequado

## Exemplos de Uso

### Botão
```tsx
<Button
  variant="primary"
  size="md"
  onClick={() => console.log('clicked')}
>
  Salvar
</Button>
```

### Input
```tsx
<Input
  type="email"
  label="Email"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```

## Troubleshooting

### Problemas Comuns

1. **Estilização**
   - Verifique classes Tailwind
   - Confirme variáveis de tema
   - Valide responsividade

2. **Performance**
   - Use React DevTools
   - Verifique re-renders
   - Otimize imports

3. **Acessibilidade**
   - Use ferramentas de auditoria
   - Teste navegação por teclado
   - Verifique contraste

## Contribuição

1. Siga o padrão de código
2. Documente novos componentes
3. Adicione testes
4. Mantenha acessibilidade 