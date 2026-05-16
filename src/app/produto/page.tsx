import { getProdutos } from "./actions";
import ProdutoClient from "./produto-client";

export default async function ProdutoPage() {
  const produtos = await getProdutos();

  return <ProdutoClient initialData={produtos} />;
}
