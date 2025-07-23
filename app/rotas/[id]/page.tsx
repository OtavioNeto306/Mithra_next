'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { MainLayout } from '@/components/main-layout'; // Importar MainLayout

interface ItemPedido {
  ordem: number;
  codigoProduto: string;
  nomeProduto: string;
  unidadeProduto: string;
  quantidade: number;
  valorUnitario: number;
  totalItem: number;
  descontoItem: number;
}

interface Pedido {
  codigoCliente: string;
  valorPedido: string;
  documentoPedido: string;
  numeroCabPdv: string;
  clienteCabPdv: string;
  valorTotalCabPdv: string;
  emissaoCabPdv: string;
  observacaoCabPdv: string;
  itens: ItemPedido[];
}

export default function RotaDetalhesPage() {
  const params = useParams();
  const rotaId = params.id as string;
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const response = await fetch(`/api/rotas/${rotaId}/pedidos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPedidos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (rotaId) {
      fetchPedidos();
    }
  }, [rotaId]);

  if (loading) {
    return (
      <MainLayout>
        <div>Carregando detalhes da rota...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div>Erro ao carregar detalhes da rota: {error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos da Rota: {rotaId}</CardTitle>
          </CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <p>Nenhum pedido encontrado para esta rota.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente (itecar)</TableHead>
                    <TableHead>Valor (itecar)</TableHead>
                    <TableHead>Documento (itecar)</TableHead>
                    <TableHead>Número (cabpdv)</TableHead>
                    <TableHead>Cliente (cabpdv)</TableHead>
                    <TableHead>Valor Total (cabpdv)</TableHead>
                    <TableHead>Emissão (cabpdv)</TableHead>
                    <TableHead>Observação (cabpdv)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido: Pedido, index: number) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell>{pedido.codigoCliente}</TableCell>
                        <TableCell>{pedido.valorPedido}</TableCell>
                        <TableCell>{pedido.documentoPedido}</TableCell>
                        <TableCell>{pedido.numeroCabPdv}</TableCell>
                        <TableCell>{pedido.clienteCabPdv}</TableCell>
                        <TableCell>{pedido.valorTotalCabPdv}</TableCell>
                        <TableCell>{pedido.emissaoCabPdv}</TableCell>
                        <TableCell>{pedido.observacaoCabPdv}</TableCell>
                      </TableRow>
                      {pedido.itens && pedido.itens.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <div className="ml-4 mt-2 mb-2">
                              <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Ordem</TableHead>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Unidade</TableHead>
                                    <TableHead>Quantidade</TableHead>
                                    <TableHead>Valor Unitário</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Desconto</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {pedido.itens.map((item: ItemPedido, itemIndex: number) => (
                                    <TableRow key={itemIndex}>
                                      <TableCell>{item.ordem}</TableCell>
                                      <TableCell>{item.nomeProduto} ({item.codigoProduto})</TableCell>
                                      <TableCell>{item.unidadeProduto}</TableCell>
                                      <TableCell>{item.quantidade}</TableCell>
                                      <TableCell>{item.valorUnitario}</TableCell>
                                      <TableCell>{item.totalItem}</TableCell>
                                      <TableCell>{item.descontoItem}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <Button onClick={() => window.print()}>Gerar Relatório (PDF)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}