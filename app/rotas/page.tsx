'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import Link from 'next/link';
import { MainLayout } from '../../components/main-layout'; // Importar MainLayout
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Rota {
  codigoRota: string;
  nomeRota: string;
  codigoVendedor: string;
  dataRota: string;
  nomeVendedor: string;
}

interface Pedido {
  cliente: string;
  documento: string;
  valor: number;
  endereco?: string;
  municipio?: string;
  estado?: string;
  bairro?: string;
  cep?: string;
  telefone?: string;
}

export default function RotasPage() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPedidosModal, setShowPedidosModal] = useState(false);
  const [selectedRotaCodigo, setSelectedRotaCodigo] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const [pedidosError, setPedidosError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRotas() {
      try {
        const response = await fetch('/api/rotas');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRotas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRotas();
  }, []);

  const handleVerPedidos = async (rotaCodigo: string) => {
    setSelectedRotaCodigo(rotaCodigo);
    setShowPedidosModal(true);
    setPedidosLoading(true);
    setPedidosError(null);
    try {
      const response = await fetch(`/api/rotas/${rotaCodigo}/pedidos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPedidos(data);
    } catch (err: any) {
      setPedidosError(err.message);
    } finally {
      setPedidosLoading(false);
    }
  };

  const handlePrintPedidos = () => {
    const doc = new jsPDF();
    
    // Encontrar informações da rota selecionada
    const rotaSelecionada = rotas.find(rota => rota.codigoRota === selectedRotaCodigo);
    
    // Título do documento
    doc.setFontSize(16);
    doc.text('Relatório de Rota e Pedidos', 14, 20);
    
    // Informações da rota
    doc.setFontSize(12);
    let yPosition = 35;
    
    if (rotaSelecionada) {
      doc.text(`Código da Rota: ${rotaSelecionada.codigoRota}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Nome da Rota: ${rotaSelecionada.nomeRota}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Vendedor: ${rotaSelecionada.nomeVendedor} (${rotaSelecionada.codigoVendedor})`, 14, yPosition);
      yPosition += 8;
      doc.text(`Data: ${rotaSelecionada.dataRota}`, 14, yPosition);
      yPosition += 15;
    }
    
    // Título da tabela de pedidos
    doc.setFontSize(14);
    doc.text('Lista de Pedidos:', 14, yPosition);
    yPosition += 10;

    // Tabela de pedidos
    const tableColumn = ["Cliente", "Documento", "Valor (R$)", "Endereço", "Município", "Estado", "Bairro", "CEP", "Telefone"];
    const tableRows: any[] = [];

    pedidos.forEach(pedido => {
      const pedidoData = [
        pedido.cliente,
        pedido.documento,
        `R$ ${(pedido.valor ?? 0).toFixed(2)}`,
        pedido.endereco || '-',
        pedido.municipio || '-',
        pedido.estado || '-',
        pedido.bairro || '-',
        pedido.cep || '-',
        pedido.telefone || '-'
      ];
      tableRows.push(pedidoData);
    });

    // Totalizador
    const valorTotal = pedidos.reduce((total, pedido) => total + (pedido.valor ?? 0), 0);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPosition,
      foot: [['Total', '', `R$ ${valorTotal.toFixed(2)}`, '', '', '', '', '', '']],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });
    
    doc.save(`relatorio_rota_${selectedRotaCodigo}.pdf`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div>Carregando rotas...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div>Erro ao carregar rotas: {error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Visualização de Rotas</CardTitle>
          </CardHeader>
          <CardContent>
            {rotas.length === 0 ? (
              <p>Nenhuma rota encontrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Rota</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rotas.map((rota, index) => (
                    <TableRow key={index}>
                      <TableCell>{rota.nomeRota}</TableCell>
                      <TableCell>{rota.nomeVendedor} ({rota.codigoVendedor})</TableCell>
                      <TableCell>{rota.dataRota}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerPedidos(rota.codigoRota)}
                        >
                          Ver Pedidos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={showPedidosModal} onOpenChange={setShowPedidosModal}>
          <DialogContent className="sm:max-w-[1200px] max-w-[95vw]">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle>Pedidos da Rota {selectedRotaCodigo}</DialogTitle>
                  <DialogDescription>
                    Lista de pedidos vinculados a esta rota.
                  </DialogDescription>
                </div>
                <Button
                  onClick={handlePrintPedidos}
                  disabled={pedidosLoading || !!pedidosError || pedidos.length === 0}
                  variant="outline"
                  size="sm"
                >
                  Imprimir
                </Button>
              </div>
            </DialogHeader>
            {pedidosLoading ? (
              <div>Carregando pedidos...</div>
            ) : pedidosError ? (
              <div>Erro ao carregar pedidos: {pedidosError}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>CEP</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">Nenhum pedido encontrado para esta rota.</TableCell>
                    </TableRow>
                  ) : (
                    pedidos.map((pedido, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{pedido.cliente}</TableCell>
                        <TableCell>{pedido.documento}</TableCell>
                        <TableCell>{(pedido.valor ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{pedido.endereco || '-'}</TableCell>
                        <TableCell>{pedido.municipio || '-'}</TableCell>
                        <TableCell>{pedido.estado || '-'}</TableCell>
                        <TableCell>{pedido.bairro || '-'}</TableCell>
                        <TableCell>{pedido.cep || '-'}</TableCell>
                        <TableCell>{pedido.telefone || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}