import { getVendas, getClientes } from "./actions";
import VendaClient from "./venda-client";

export default async function VendaPage() {
  const [vendas, clientes] = await Promise.all([
    getVendas(),
    getClientes()
  ]);

  return <VendaClient initialData={vendas} clientes={clientes} />;
}
