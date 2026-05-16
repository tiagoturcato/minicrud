"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProdutoVendas() {
  return await prisma.produtoVenda.findMany({
    include: {
      venda: {
        include: { cliente: true }
      },
      produto: true,
    },
    orderBy: { idproduto_venda: "desc" },
  });
}

export async function getVendas() {
  return await prisma.venda.findMany({
    include: { cliente: true },
    orderBy: { idvenda: "desc" },
  });
}

export async function getProdutos() {
  return await prisma.produto.findMany({
    where: { ativo: 1 },
    orderBy: { nome: "asc" },
  });
}

export async function saveProdutoVenda(data: {
  idproduto_venda?: number;
  quantidade: number;
  preco: number;
  total: number;
  venda_idvenda: number;
  venda_cliente_idCliente: number;
  produto_idproduto: number;
}) {
  const payload = {
    quantidade: data.quantidade,
    preco: data.preco,
    total: data.total,
    venda_idvenda: data.venda_idvenda,
    venda_cliente_idCliente: data.venda_cliente_idCliente,
    produto_idproduto: data.produto_idproduto,
  };

  if (data.idproduto_venda) {
    await prisma.produtoVenda.update({
      where: { idproduto_venda: data.idproduto_venda },
      data: payload,
    });
  } else {
    await prisma.produtoVenda.create({ data: payload });
  }
  revalidatePath("/produto_venda");
}

export async function deleteProdutoVenda(idproduto_venda: number) {
  await prisma.produtoVenda.delete({ where: { idproduto_venda } });
  revalidatePath("/produto_venda");
}
