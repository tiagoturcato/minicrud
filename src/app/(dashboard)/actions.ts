"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [totalCidades, totalClientes, totalProdutos, totalVendas, totalVendido] = await Promise.all([
    prisma.cidade.count(),
    prisma.cliente.count(),
    prisma.produto.count(),
    prisma.venda.count(),
    prisma.venda.aggregate({ _sum: { total: true } }),
  ]);

  const totalVendidoValor = totalVendido._sum.total || 0;

  const avgPreco = await prisma.produto.aggregate({
    _avg: {
      preco_venda: true,
    },
  });

  return {
    totalCidades,
    totalClientes,
    totalProdutos,
    totalVendas,
    totalVendido: totalVendidoValor,
    avgPreco: avgPreco._avg.preco_venda || 0,
    ticketMedio: totalVendas > 0 ? totalVendidoValor / totalVendas : 0,
  };
}
