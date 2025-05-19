import { Vendedor } from "@/hooks/useVendedores";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  vendedores: Vendedor[];
  loading?: boolean;
  error?: string | null;
  columns?: ("CODI_PES" | "NOME_PES")[];
}

export function VendedoresTable({ 
  vendedores, 
  loading, 
  error,
  columns = ["CODI_PES", "NOME_PES"] 
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">Carregando vendedores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (vendedores.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">Nenhum vendedor encontrado</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.includes("CODI_PES") && <TableHead>Código</TableHead>}
            {columns.includes("NOME_PES") && <TableHead>Nome</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendedores.map((v) => (
            <TableRow key={v.CODI_PES}>
              {columns.includes("CODI_PES") && <TableCell>{v.CODI_PES}</TableCell>}
              {columns.includes("NOME_PES") && <TableCell>{v.NOME_PES}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 