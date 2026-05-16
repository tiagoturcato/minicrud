"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProdutos() {
  return await prisma.produto.findMany({
    orderBy: { nome: "asc" },
  });
}

export async function saveProduto(data: {
  idproduto?: number;
  nome: string;
  sku: string;
  preco_venda: number;
  custo: number;
  ativo: number;
}) {
  const payload = {
    nome: data.nome,
    sku: data.sku,
    preco_venda: data.preco_venda,
    custo: data.custo,
    ativo: data.ativo,
  };

  if (data.idproduto) {
    await prisma.produto.update({
      where: { idproduto: data.idproduto },
      data: payload,
    });
  } else {
    await prisma.produto.create({ data: payload });
  }
  revalidatePath("/produto");
}

export async function deleteProduto(idproduto: number) {
  await prisma.produto.delete({ where: { idproduto } });
  revalidatePath("/produto");
}
