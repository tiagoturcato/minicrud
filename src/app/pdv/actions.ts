"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function buscarClientes(termo: string) {
  if (!termo.trim()) return [];
  const id = parseInt(termo);
  return await prisma.cliente.findMany({
    where: {
      ativo: 1,
      OR: [
        { nome: { contains: termo } },
        ...(isNaN(id) ? [] : [{ idCliente: id }]),
      ],
    },
    include: { cidade: true },
    take: 10,
    orderBy: { nome: "asc" },
  });
}

export async function buscarProdutos(termo: string) {
  if (!termo.trim()) return [];
  const id = parseInt(termo);
  return await prisma.produto.findMany({
    where: {
      ativo: 1,
      OR: [
        { nome: { contains: termo } },
        { sku: { contains: termo } },
        ...(isNaN(id) ? [] : [{ idproduto: id }]),
      ],
    },
    take: 10,
    orderBy: { nome: "asc" },
  });
}

export type ItemCarrinho = {
  produto_idproduto: number;
  nome: string;
  sku: string;
  quantidade: number;
  preco: number;
  total: number;
};

export type FinalizarVendaPayload = {
  cliente_idCliente: number;
  tipo: string;
  formapagto: string;
  desconto: number;
  total: number;
  itens: ItemCarrinho[];
};

export async function finalizarVenda(payload: FinalizarVendaPayload) {
  // Regra 1: Não permitir venda sem itens
  if (!payload.itens || payload.itens.length === 0) {
    return { success: false, error: "Não é possível finalizar uma venda sem itens." };
  }

  // Regra 2: Não permitir desconto de 100% (total zero ou negativo)
  if (payload.total <= 0) {
    return {
      success: false,
      error: "Desconto inválido! O valor total da venda não pode ser R$ 0,00. O desconto não pode ser igual ou maior que o subtotal.",
    };
  }

  // Regra 3: Anti-duplicata — mesmo cliente, mesmo total, < 10 minutos
  const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const vendaRecente = await prisma.venda.findFirst({
    where: {
      cliente_idCliente: payload.cliente_idCliente,
      total: payload.total,
      created_at: { gte: dezMinutosAtras },
    },
  });

  if (vendaRecente) {
    return {
      success: false,
      error: `Venda duplicada detectada! Já existe uma venda de R$ ${payload.total.toFixed(2)} para este cliente nos últimos 10 minutos (Venda #${vendaRecente.idvenda}).`,
    };
  }

  // Criar Venda + Itens em transação atômica
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const agora = new Date().toISOString();

    const venda = await prisma.$transaction(async (tx) => {
      const novaVenda = await tx.venda.create({
        data: {
          data_venda: hoje,
          cliente_idCliente: payload.cliente_idCliente,
          tipo: payload.tipo,
          formapagto: payload.formapagto,
          desconto: payload.desconto,
          total: payload.total,
          created_at: agora,
        },
      });

      await tx.produtoVenda.createMany({
        data: payload.itens.map((item) => ({
          quantidade: item.quantidade,
          preco: item.preco,
          total: item.total,
          venda_idvenda: novaVenda.idvenda,
          venda_cliente_idCliente: payload.cliente_idCliente,
          produto_idproduto: item.produto_idproduto,
        })),
      });

      return novaVenda;
    });

    revalidatePath("/venda");
    revalidatePath("/");

    return { success: true, idvenda: venda.idvenda };
  } catch (err: any) {
    return { success: false, error: `Erro ao salvar venda: ${err.message}` };
  }
}
