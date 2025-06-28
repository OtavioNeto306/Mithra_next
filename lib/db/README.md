# Documentação do Banco de Dados

## Visão Geral
O sistema utiliza dois bancos de dados:
1. **Oracle** - Banco de dados principal para dados de negócio
2. **SQLite** - Banco de dados local para autenticação e configurações

## Estrutura do Oracle

### Tabelas Principais

#### PESSOAL
```sql
CREATE TABLE PESSOAL (
    CODI_PES NUMBER PRIMARY KEY,
    NOME_PES VARCHAR2(100),
    SITU_PES CHAR(1)
);
```
- Armazena informações básicas das pessoas
- `SITU_PES = 'A'` indica registro ativo

#### VENDEDOR
```sql
CREATE TABLE VENDEDOR (
    CODI_PES NUMBER PRIMARY KEY,
    -- outros campos
    FOREIGN KEY (CODI_PES) REFERENCES PESSOAL(CODI_PES)
);
```
- Relaciona pessoas com a função de vendedor

## Estrutura do SQLite

### Tabelas

#### USERCC (Usuários e Comissões)
```sql
CREATE TABLE USERCC (
    USUARIO VARCHAR(20) PRIMARY KEY,
    NOME VARCHAR(100),
    COMISSAO DECIMAL(10,2),
    PASSWORD VARCHAR(255),
    USERNAME VARCHAR(50),
    UACESSO VARCHAR(20),
    BLOQUEADO INTEGER DEFAULT 0
);
```
- Armazena dados de autenticação e comissões
- `PASSWORD` é armazenado com hash bcrypt
- `BLOQUEADO = 1` indica usuário bloqueado

## Conexões

### Oracle
- Utiliza ODBC para conexão
- Configuração em `lib/db/odbc.ts`
- Credenciais em variáveis de ambiente

### SQLite
- Arquivo local: `usuarios.db3`
- Configuração em `lib/db/config.ts`
- Acesso via `sqlite3` npm package

## Migrações

As migrações do banco de dados estão localizadas em `lib/db/migrations/`.
Para executar as migrações:

```bash
npm run migrate
# ou
pnpm migrate
```

## Funções Principais

### Oracle
- `executeQuery(query: string)`: Executa consultas SQL no Oracle
- `getConnection()`: Obtém conexão com o banco Oracle

### SQLite
- `openDb()`: Abre conexão com o SQLite
- `getUserByCode(codigo: string)`: Busca usuário por código
- `updateUserCommission(codigo: string, comissao: string)`: Atualiza comissão
- `getAllUsers()`: Lista todos os usuários

## Boas Práticas

1. **Segurança**
   - Sempre use prepared statements
   - Nunca exponha credenciais
   - Valide inputs antes de queries

2. **Performance**
   - Use índices apropriadamente
   - Feche conexões após uso
   - Limite resultados de queries

3. **Manutenção**
   - Documente alterações no banco
   - Mantenha backups regulares
   - Versionamento de schema

## Troubleshooting

### Problemas Comuns

1. **Erro de Conexão Oracle**
   - Verifique credenciais
   - Confirme se o serviço está rodando
   - Valide configuração ODBC

2. **Erro SQLite**
   - Verifique permissões do arquivo
   - Confirme se o arquivo existe
   - Valide integridade do banco

### Logs
- Logs de erro são salvos no console
- Use `console.error()` para erros críticos
- Implemente logging adequado em produção 