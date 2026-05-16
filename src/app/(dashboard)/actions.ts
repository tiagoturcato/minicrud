"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [totalCidades, totalClientes, totalProdutos, totalAtivos] = await Promise.all([
    prisma.cidade.count(),
    prisma.cliente.count(),
    prisma.produto.count(),
    prisma.cliente.count({ where: { ativo: 1 } }),
  ]);

  const avgPreco = await prisma.produto.aggregate({
    _avg: {
      preco_venda: true,
    },
  });

  return {
    totalCidades,
    totalClientes,
    totalProdutos,
    totalAtivos,
    avgPreco: avgPreco._avg.preco_venda || 0,
  };
}
