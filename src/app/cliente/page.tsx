import { getClientes, getCidades } from "./actions";
import ClienteClient from "./cliente-client";

export default async function ClientePage() {
  const [clientes, cidades] = await Promise.all([getClientes(), getCidades()]);

  return <ClienteClient initialData={clientes} cidades={cidades} />;
}
