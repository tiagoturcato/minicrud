import { getCidades } from "./actions";
import CidadeClient from "./cidade-client";

export default async function CidadePage() {
  const cidades = await getCidades();

  return <CidadeClient initialData={cidades} />;
}
