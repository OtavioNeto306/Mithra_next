# Changelog - Melhorias do Sistema

## Data: 2025-01-22

### Correção: Busca Case-Insensitive de Produtos

**Problema:** A busca de produtos só funcionava quando digitada em caixa alta (case-sensitive).

**Solução:** Implementada busca case-insensitive na API de produtos usando a função `UPPER()` tanto no valor da busca quanto nos campos do banco.

**Arquivo modificado:** `app/api/produtos/route.ts`

**Alteração:**
```typescript
// Antes (case-sensitive)
let whereBusca = busca 
  ? `AND (P.CODI_PSV LIKE '%${busca}%' OR P.DESC_PSV LIKE '%${busca}%')`
  : '';

// Depois (case-insensitive)
let whereBusca = busca 
  ? `AND (UPPER(P.CODI_PSV) LIKE '%${busca.toUpperCase()}%' OR UPPER(P.DESC_PSV) LIKE '%${busca.toUpperCase()}%')`
  : '';
```

**Impacto:** 
- Agora é possível buscar produtos digitando em minúsculas, maiúsculas ou combinações
- Melhora a usabilidade da busca de produtos
- Funciona tanto para código do produto quanto para descrição

**Relacionado ao projeto:** Esta correção melhora a experiência do usuário na página de produtos, permitindo busca mais flexível e intuitiva. 

## Data: 2024-05-30

### Alteração: Renomeação de 'Pedidos' para 'Orçamentos' no frontend

**Descrição:**
- Todos os textos visíveis referentes a 'Pedidos' na página de listagem foram alterados para 'Orçamentos' (singular e plural).
- O menu lateral (sidebar) agora exibe 'Orçamentos' e 'Gestão de Orçamentos'.

**Arquivos modificados:**
- app/pedidos/page.tsx
- components/sidebar.tsx

**Relacionado ao projeto:**
Padronização da nomenclatura para refletir corretamente o fluxo de orçamentos no sistema, melhorando a clareza para o usuário final. 