import { getProdutoVendas, getVendas, getProdutos } from "./actions";
import ProdutoVendaClient from "./produto_venda-client";

export default async function ProdutoVendaPage() {
  const [itens, vendas, produtos] = await Promise.all([
    getProdutoVendas(),
    getVendas(),
    getProdutos()
  ]);

  return (
    <ProdutoVendaClient 
      initialData={itens} 
      vendas={vendas} 
      produtos={produtos} 
    />
  );
}
