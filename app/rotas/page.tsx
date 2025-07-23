'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout'; // Importar MainLayout

interface Rota {
  codigoRota: string;
  nomeRota: string;
  codigoVendedor: string;
  dataRota: string;
  nomeVendedor: string;
}

export default function RotasPage() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                        <Link href={`/rotas/${rota.codigoRota}`}>
                          <Button variant="outline" size="sm">Ver Detalhes</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}