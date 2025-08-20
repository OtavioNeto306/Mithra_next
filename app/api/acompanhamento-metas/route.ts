import { NextRequest, NextResponse } from 'next/server';
import { AcompanhamentoFilter, AcompanhamentoResponse, VendaRealizada, ProgressoMeta, EvolucaoMensal, Meta } from '@/types/metas';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Interface para vendedor
interface Vendedor {
  codigo: string;
  nome: string;
}

// Função para buscar vendedores do banco usuario.db3
async function buscarVendedores(): Promise<Vendedor[]> {
  try {
    const db = await open({
      filename: 'usuarios.db3',
      driver: sqlite3.Database
    });

    const query = `
      SELECT 
        USUARIO as codigo,
        NOME as nome
      FROM USERCC 
      WHERE BLOQUEADO IS NULL OR BLOQUEADO = 0
      ORDER BY NOME
    `;

    const result = await db.all(query) as Vendedor[];
    await db.close();
    
    return result || [];
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    return [];
  }
}

// Dados mockados de metas - Expandidos para apresentação
const metasMockadas: Meta[] = [
  // Vendedor V001 - João Silva
  { id: 1, codigo_vendedor: 'V001', ano: 2024, mes: 1, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN001', valor_meta: 50000, observacoes: 'Meta Janeiro - Fornecedor Alpha', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 2, codigo_vendedor: 'V001', ano: 2024, mes: 2, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN001', valor_meta: 55000, observacoes: 'Meta Fevereiro - Fornecedor Alpha', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 3, codigo_vendedor: 'V001', ano: 2024, mes: 3, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN001', valor_meta: 60000, observacoes: 'Meta Março - Fornecedor Alpha', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },
  { id: 4, codigo_vendedor: 'V001', ano: 2024, mes: 1, tipo_meta: 'produto', codigo_produto: 'PROD001', valor_meta: 25000, observacoes: 'Meta Janeiro - Produto Premium', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 5, codigo_vendedor: 'V001', ano: 2024, mes: 2, tipo_meta: 'produto', codigo_produto: 'PROD001', valor_meta: 28000, observacoes: 'Meta Fevereiro - Produto Premium', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 6, codigo_vendedor: 'V001', ano: 2024, mes: 3, tipo_meta: 'produto', codigo_produto: 'PROD001', valor_meta: 30000, observacoes: 'Meta Março - Produto Premium', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },

  // Vendedor V002 - Maria Santos
  { id: 7, codigo_vendedor: 'V002', ano: 2024, mes: 1, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN002', valor_meta: 75000, observacoes: 'Meta Janeiro - Fornecedor Beta', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 8, codigo_vendedor: 'V002', ano: 2024, mes: 2, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN002', valor_meta: 80000, observacoes: 'Meta Fevereiro - Fornecedor Beta', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 9, codigo_vendedor: 'V002', ano: 2024, mes: 3, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN002', valor_meta: 85000, observacoes: 'Meta Março - Fornecedor Beta', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },
  { id: 10, codigo_vendedor: 'V002', ano: 2024, mes: 1, tipo_meta: 'produto', codigo_produto: 'PROD002', valor_meta: 40000, observacoes: 'Meta Janeiro - Produto Standard', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 11, codigo_vendedor: 'V002', ano: 2024, mes: 2, tipo_meta: 'produto', codigo_produto: 'PROD002', valor_meta: 42000, observacoes: 'Meta Fevereiro - Produto Standard', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 12, codigo_vendedor: 'V002', ano: 2024, mes: 3, tipo_meta: 'produto', codigo_produto: 'PROD002', valor_meta: 45000, observacoes: 'Meta Março - Produto Standard', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },

  // Vendedor V003 - Carlos Oliveira
  { id: 13, codigo_vendedor: 'V003', ano: 2024, mes: 1, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN003', valor_meta: 65000, observacoes: 'Meta Janeiro - Fornecedor Gamma', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 14, codigo_vendedor: 'V003', ano: 2024, mes: 2, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN003', valor_meta: 70000, observacoes: 'Meta Fevereiro - Fornecedor Gamma', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 15, codigo_vendedor: 'V003', ano: 2024, mes: 3, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN003', valor_meta: 72000, observacoes: 'Meta Março - Fornecedor Gamma', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },
  { id: 16, codigo_vendedor: 'V003', ano: 2024, mes: 1, tipo_meta: 'produto', codigo_produto: 'PROD003', valor_meta: 35000, observacoes: 'Meta Janeiro - Produto Básico', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 17, codigo_vendedor: 'V003', ano: 2024, mes: 2, tipo_meta: 'produto', codigo_produto: 'PROD003', valor_meta: 38000, observacoes: 'Meta Fevereiro - Produto Básico', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 18, codigo_vendedor: 'V003', ano: 2024, mes: 3, tipo_meta: 'produto', codigo_produto: 'PROD003', valor_meta: 40000, observacoes: 'Meta Março - Produto Básico', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },

  // Vendedor V004 - Ana Costa
  { id: 19, codigo_vendedor: 'V004', ano: 2024, mes: 1, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN004', valor_meta: 90000, observacoes: 'Meta Janeiro - Fornecedor Delta', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 20, codigo_vendedor: 'V004', ano: 2024, mes: 2, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN004', valor_meta: 95000, observacoes: 'Meta Fevereiro - Fornecedor Delta', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 21, codigo_vendedor: 'V004', ano: 2024, mes: 3, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN004', valor_meta: 100000, observacoes: 'Meta Março - Fornecedor Delta', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },
  { id: 22, codigo_vendedor: 'V004', ano: 2024, mes: 1, tipo_meta: 'produto', codigo_produto: 'PROD004', valor_meta: 50000, observacoes: 'Meta Janeiro - Produto Deluxe', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 23, codigo_vendedor: 'V004', ano: 2024, mes: 2, tipo_meta: 'produto', codigo_produto: 'PROD004', valor_meta: 52000, observacoes: 'Meta Fevereiro - Produto Deluxe', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 24, codigo_vendedor: 'V004', ano: 2024, mes: 3, tipo_meta: 'produto', codigo_produto: 'PROD004', valor_meta: 55000, observacoes: 'Meta Março - Produto Deluxe', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },

  // Vendedor V005 - Pedro Lima
  { id: 25, codigo_vendedor: 'V005', ano: 2024, mes: 1, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN005', valor_meta: 45000, observacoes: 'Meta Janeiro - Fornecedor Epsilon', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 26, codigo_vendedor: 'V005', ano: 2024, mes: 2, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN005', valor_meta: 48000, observacoes: 'Meta Fevereiro - Fornecedor Epsilon', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 27, codigo_vendedor: 'V005', ano: 2024, mes: 3, tipo_meta: 'fornecedor', codigo_fornecedor: 'FORN005', valor_meta: 50000, observacoes: 'Meta Março - Fornecedor Epsilon', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' },
  { id: 28, codigo_vendedor: 'V005', ano: 2024, mes: 1, tipo_meta: 'produto', codigo_produto: 'PROD005', valor_meta: 20000, observacoes: 'Meta Janeiro - Produto Econômico', data_cadastro: '2024-01-01T00:00:00Z', data_atualizacao: '2024-01-01T00:00:00Z' },
  { id: 29, codigo_vendedor: 'V005', ano: 2024, mes: 2, tipo_meta: 'produto', codigo_produto: 'PROD005', valor_meta: 22000, observacoes: 'Meta Fevereiro - Produto Econômico', data_cadastro: '2024-02-01T00:00:00Z', data_atualizacao: '2024-02-01T00:00:00Z' },
  { id: 30, codigo_vendedor: 'V005', ano: 2024, mes: 3, tipo_meta: 'produto', codigo_produto: 'PROD005', valor_meta: 25000, observacoes: 'Meta Março - Produto Econômico', data_cadastro: '2024-03-01T00:00:00Z', data_atualizacao: '2024-03-01T00:00:00Z' }
];

// Dados mockados de vendas realizadas - Expandidos para apresentação
const vendasMockadas: VendaRealizada[] = [
  // Vendedor V001 - João Silva (Performance mista)
  { id: 1, codigo_vendedor: 'V001', ano: 2024, mes: 1, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN001', valor_vendido: 52000, data_venda: '2024-01-15', numero_pedido: 'PED001' }, // 104% da meta
  { id: 2, codigo_vendedor: 'V001', ano: 2024, mes: 2, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN001', valor_vendido: 48000, data_venda: '2024-02-10', numero_pedido: 'PED002' }, // 87% da meta
  { id: 3, codigo_vendedor: 'V001', ano: 2024, mes: 3, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN001', valor_vendido: 60000, data_venda: '2024-03-05', numero_pedido: 'PED003' }, // 100% da meta
  { id: 4, codigo_vendedor: 'V001', ano: 2024, mes: 1, tipo_venda: 'produto', codigo_produto: 'PROD001', valor_vendido: 27000, quantidade_vendida: 50, data_venda: '2024-01-20', numero_pedido: 'PED004' }, // 108% da meta
  { id: 5, codigo_vendedor: 'V001', ano: 2024, mes: 2, tipo_venda: 'produto', codigo_produto: 'PROD001', valor_vendido: 25000, quantidade_vendida: 45, data_venda: '2024-02-20', numero_pedido: 'PED005' }, // 89% da meta
  { id: 6, codigo_vendedor: 'V001', ano: 2024, mes: 3, tipo_venda: 'produto', codigo_produto: 'PROD001', valor_vendido: 32000, quantidade_vendida: 60, data_venda: '2024-03-18', numero_pedido: 'PED006' }, // 107% da meta

  // Vendedor V002 - Maria Santos (Alto desempenho)
  { id: 7, codigo_vendedor: 'V002', ano: 2024, mes: 1, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN002', valor_vendido: 82000, data_venda: '2024-01-12', numero_pedido: 'PED007' }, // 109% da meta
  { id: 8, codigo_vendedor: 'V002', ano: 2024, mes: 2, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN002', valor_vendido: 88000, data_venda: '2024-02-15', numero_pedido: 'PED008' }, // 110% da meta
  { id: 9, codigo_vendedor: 'V002', ano: 2024, mes: 3, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN002', valor_vendido: 95000, data_venda: '2024-03-10', numero_pedido: 'PED009' }, // 112% da meta
  { id: 10, codigo_vendedor: 'V002', ano: 2024, mes: 1, tipo_venda: 'produto', codigo_produto: 'PROD002', valor_vendido: 44000, quantidade_vendida: 30, data_venda: '2024-01-25', numero_pedido: 'PED010' }, // 110% da meta
  { id: 11, codigo_vendedor: 'V002', ano: 2024, mes: 2, tipo_venda: 'produto', codigo_produto: 'PROD002', valor_vendido: 46000, quantidade_vendida: 35, data_venda: '2024-02-28', numero_pedido: 'PED011' }, // 110% da meta
  { id: 12, codigo_vendedor: 'V002', ano: 2024, mes: 3, tipo_venda: 'produto', codigo_produto: 'PROD002', valor_vendido: 49000, quantidade_vendida: 40, data_venda: '2024-03-25', numero_pedido: 'PED012' }, // 109% da meta

  // Vendedor V003 - Carlos Oliveira (Performance baixa)
  { id: 13, codigo_vendedor: 'V003', ano: 2024, mes: 1, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN003', valor_vendido: 52000, data_venda: '2024-01-18', numero_pedido: 'PED013' }, // 80% da meta
  { id: 14, codigo_vendedor: 'V003', ano: 2024, mes: 2, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN003', valor_vendido: 58000, data_venda: '2024-02-22', numero_pedido: 'PED014' }, // 83% da meta
  { id: 15, codigo_vendedor: 'V003', ano: 2024, mes: 3, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN003', valor_vendido: 65000, data_venda: '2024-03-15', numero_pedido: 'PED015' }, // 90% da meta
  { id: 16, codigo_vendedor: 'V003', ano: 2024, mes: 1, tipo_venda: 'produto', codigo_produto: 'PROD003', valor_vendido: 28000, quantidade_vendida: 25, data_venda: '2024-01-30', numero_pedido: 'PED016' }, // 80% da meta
  { id: 17, codigo_vendedor: 'V003', ano: 2024, mes: 2, tipo_venda: 'produto', codigo_produto: 'PROD003', valor_vendido: 32000, quantidade_vendida: 28, data_venda: '2024-02-25', numero_pedido: 'PED017' }, // 84% da meta
  { id: 18, codigo_vendedor: 'V003', ano: 2024, mes: 3, tipo_venda: 'produto', codigo_produto: 'PROD003', valor_vendido: 38000, quantidade_vendida: 32, data_venda: '2024-03-28', numero_pedido: 'PED018' }, // 95% da meta

  // Vendedor V004 - Ana Costa (Excelente performance)
  { id: 19, codigo_vendedor: 'V004', ano: 2024, mes: 1, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN004', valor_vendido: 105000, data_venda: '2024-01-08', numero_pedido: 'PED019' }, // 117% da meta
  { id: 20, codigo_vendedor: 'V004', ano: 2024, mes: 2, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN004', valor_vendido: 112000, data_venda: '2024-02-12', numero_pedido: 'PED020' }, // 118% da meta
  { id: 21, codigo_vendedor: 'V004', ano: 2024, mes: 3, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN004', valor_vendido: 125000, data_venda: '2024-03-08', numero_pedido: 'PED021' }, // 125% da meta
  { id: 22, codigo_vendedor: 'V004', ano: 2024, mes: 1, tipo_venda: 'produto', codigo_produto: 'PROD004', valor_vendido: 58000, quantidade_vendida: 45, data_venda: '2024-01-22', numero_pedido: 'PED022' }, // 116% da meta
  { id: 23, codigo_vendedor: 'V004', ano: 2024, mes: 2, tipo_venda: 'produto', codigo_produto: 'PROD004', valor_vendido: 62000, quantidade_vendida: 48, data_venda: '2024-02-18', numero_pedido: 'PED023' }, // 119% da meta
  { id: 24, codigo_vendedor: 'V004', ano: 2024, mes: 3, tipo_venda: 'produto', codigo_produto: 'PROD004', valor_vendido: 68000, quantidade_vendida: 52, data_venda: '2024-03-22', numero_pedido: 'PED024' }, // 124% da meta

  // Vendedor V005 - Pedro Lima (Performance em recuperação)
  { id: 25, codigo_vendedor: 'V005', ano: 2024, mes: 1, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN005', valor_vendido: 36000, data_venda: '2024-01-28', numero_pedido: 'PED025' }, // 80% da meta
  { id: 26, codigo_vendedor: 'V005', ano: 2024, mes: 2, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN005', valor_vendido: 44000, data_venda: '2024-02-26', numero_pedido: 'PED026' }, // 92% da meta
  { id: 27, codigo_vendedor: 'V005', ano: 2024, mes: 3, tipo_venda: 'fornecedor', codigo_fornecedor: 'FORN005', valor_vendido: 52000, data_venda: '2024-03-26', numero_pedido: 'PED027' }, // 104% da meta
  { id: 28, codigo_vendedor: 'V005', ano: 2024, mes: 1, tipo_venda: 'produto', codigo_produto: 'PROD005', valor_vendido: 16000, quantidade_vendida: 20, data_venda: '2024-01-26', numero_pedido: 'PED028' }, // 80% da meta
  { id: 29, codigo_vendedor: 'V005', ano: 2024, mes: 2, tipo_venda: 'produto', codigo_produto: 'PROD005', valor_vendido: 20000, quantidade_vendida: 22, data_venda: '2024-02-24', numero_pedido: 'PED029' }, // 91% da meta
  { id: 30, codigo_vendedor: 'V005', ano: 2024, mes: 3, tipo_venda: 'produto', codigo_produto: 'PROD005', valor_vendido: 26000, quantidade_vendida: 25, data_venda: '2024-03-24', numero_pedido: 'PED030' } // 104% da meta
];

function calcularStatus(valorMeta: number, valorRealizado: number): 'nao_iniciado' | 'em_andamento' | 'atingida' | 'superada' {
  if (valorRealizado === 0) return 'nao_iniciado';
  if (valorRealizado < valorMeta) return 'em_andamento';
  if (valorRealizado >= valorMeta && valorRealizado < valorMeta * 1.1) return 'atingida';
  return 'superada';
}

function filtrarVendas(vendas: VendaRealizada[], filtros: AcompanhamentoFilter): VendaRealizada[] {
  return vendas.filter(venda => {
    if (filtros.codigo_vendedor && venda.codigo_vendedor !== filtros.codigo_vendedor) return false;
    if (filtros.ano && venda.ano !== filtros.ano) return false;
    if (filtros.mes_inicio && venda.mes < filtros.mes_inicio) return false;
    if (filtros.mes_fim && venda.mes > filtros.mes_fim) return false;
    if (filtros.tipo_meta && venda.tipo_venda !== filtros.tipo_meta) return false;
    if (filtros.codigo_fornecedor && venda.codigo_fornecedor !== filtros.codigo_fornecedor) return false;
    if (filtros.codigo_produto && venda.codigo_produto !== filtros.codigo_produto) return false;
    return true;
  });
}

function gerarProgressoMetas(metas: any[], vendas: VendaRealizada[], vendedores: Vendedor[]): ProgressoMeta[] {
  return metas.map(meta => {
    const vendasMeta = vendas.filter(venda => {
      return venda.codigo_vendedor === meta.codigo_vendedor &&
             venda.ano === meta.ano &&
             venda.mes === meta.mes &&
             venda.tipo_venda === meta.tipo_meta &&
             (meta.tipo_meta === 'fornecedor' ? 
               venda.codigo_fornecedor === meta.codigo_fornecedor :
               venda.codigo_produto === meta.codigo_produto);
    });

    const valorRealizado = vendasMeta.reduce((total, venda) => total + venda.valor_vendido, 0);
    const percentualAtingido = meta.valor_meta > 0 ? (valorRealizado / meta.valor_meta) * 100 : 0;
    const status = calcularStatus(meta.valor_meta, valorRealizado);
    const diferenca = valorRealizado - meta.valor_meta;
    
    // Buscar nome do vendedor
    const vendedor = vendedores.find(v => v.codigo === meta.codigo_vendedor);
    const nomeVendedor = vendedor ? vendedor.nome : meta.codigo_vendedor;

    return {
      meta_id: meta.id,
      codigo_vendedor: meta.codigo_vendedor,
      nome_vendedor: nomeVendedor,
      ano: meta.ano,
      mes: meta.mes,
      tipo_meta: meta.tipo_meta,
      codigo_fornecedor: meta.codigo_fornecedor,
      codigo_produto: meta.codigo_produto,
      valor_meta: meta.valor_meta,
      valor_realizado: valorRealizado,
      percentual_atingido: Math.round(percentualAtingido * 100) / 100,
      status,
      diferenca,
      vendas: vendasMeta
    };
  });
}

function gerarEvolucaoMensal(progressos: ProgressoMeta[]): EvolucaoMensal[] {
  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const evolucaoPorMes = new Map<string, { valor_meta: number; valor_realizado: number; ano: number; mes: number }>();

  progressos.forEach(progresso => {
    const chave = `${progresso.ano}-${progresso.mes}`;
    const existente = evolucaoPorMes.get(chave) || { valor_meta: 0, valor_realizado: 0, ano: progresso.ano, mes: progresso.mes };
    
    existente.valor_meta += progresso.valor_meta;
    existente.valor_realizado += progresso.valor_realizado;
    
    evolucaoPorMes.set(chave, existente);
  });

  return Array.from(evolucaoPorMes.values())
    .sort((a, b) => a.ano - b.ano || a.mes - b.mes)
    .map(item => ({
      mes: item.mes,
      ano: item.ano,
      mes_nome: mesesNomes[item.mes - 1],
      valor_meta: item.valor_meta,
      valor_realizado: item.valor_realizado,
      percentual: item.valor_meta > 0 ? Math.round((item.valor_realizado / item.valor_meta) * 10000) / 100 : 0
    }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filtros: AcompanhamentoFilter = {
      codigo_vendedor: searchParams.get('codigo_vendedor') || undefined,
      ano: searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : undefined,
      mes_inicio: searchParams.get('mes_inicio') ? parseInt(searchParams.get('mes_inicio')!) : undefined,
      mes_fim: searchParams.get('mes_fim') ? parseInt(searchParams.get('mes_fim')!) : undefined,
      tipo_meta: (searchParams.get('tipo_meta') as 'fornecedor' | 'produto') || undefined,
      codigo_fornecedor: searchParams.get('codigo_fornecedor') || undefined,
      codigo_produto: searchParams.get('codigo_produto') || undefined,
      status: (searchParams.get('status') as 'nao_iniciado' | 'em_andamento' | 'atingida' | 'superada') || undefined
    };

    // Buscar vendedores do banco
    const vendedores = await buscarVendedores();

    // Filtrar metas mockadas
    let metas = metasMockadas.filter(meta => {
      if (filtros.codigo_vendedor && meta.codigo_vendedor !== filtros.codigo_vendedor) return false;
      if (filtros.ano && meta.ano !== filtros.ano) return false;
      if (filtros.tipo_meta && meta.tipo_meta !== filtros.tipo_meta) return false;
      if (filtros.codigo_fornecedor && meta.codigo_fornecedor !== filtros.codigo_fornecedor) return false;
      if (filtros.codigo_produto && meta.codigo_produto !== filtros.codigo_produto) return false;
      return true;
    });

    // Filtrar vendas mockadas
    const vendasFiltradas = filtrarVendas(vendasMockadas, filtros);

    // Gerar progressos das metas
    const progressos = gerarProgressoMetas(metas, vendasFiltradas, vendedores);

    // Filtrar por status se especificado
    const progressosFiltrados = filtros.status ? 
      progressos.filter(p => p.status === filtros.status) : 
      progressos;

    // Gerar evolução mensal
    const evolucaoMensal = gerarEvolucaoMensal(progressosFiltrados);

    // Calcular resumo
    const totalMetas = progressosFiltrados.length;
    const metasAtingidas = progressosFiltrados.filter(p => p.status === 'atingida' || p.status === 'superada').length;
    const valorTotalMetas = progressosFiltrados.reduce((total, p) => total + p.valor_meta, 0);
    const valorTotalRealizado = progressosFiltrados.reduce((total, p) => total + p.valor_realizado, 0);
    const percentualGeral = valorTotalMetas > 0 ? Math.round((valorTotalRealizado / valorTotalMetas) * 10000) / 100 : 0;

    const response: AcompanhamentoResponse = {
      success: true,
      data: {
        progressos: progressosFiltrados,
        evolucao_mensal: evolucaoMensal,
        resumo: {
          total_metas: totalMetas,
          metas_atingidas: metasAtingidas,
          valor_total_metas: valorTotalMetas,
          valor_total_realizado: valorTotalRealizado,
          percentual_geral: percentualGeral
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar acompanhamento de metas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os dados de acompanhamento'
      },
      { status: 500 }
    );
  }
}