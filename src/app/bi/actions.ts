"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardBIData() {
  const [vendas, produtos, totalClientes] = await Promise.all([
    prisma.venda.findMany({
      include: {
        cliente: { include: { cidade: true } },
        produto_vendas: { include: { produto: true } },
      },
      orderBy: { data_venda: "asc" },
    }),
    prisma.produto.findMany({ where: { ativo: 1 } }),
    prisma.cliente.count({ where: { ativo: 1 } }),
  ]);

  // ── KPIs base ───────────────────────────────────────────────────
  const totalFaturamento = vendas.reduce((s, v) => s + v.total, 0);
  const totalPedidos = vendas.length;
  const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;
  const totalDesconto = vendas.reduce((s, v) => s + v.desconto, 0);

  // ── Margem de lucro ─────────────────────────────────────────────
  let totalCusto = 0;
  let totalBruto = 0;
  for (const v of vendas) {
    for (const pv of v.produto_vendas) {
      totalCusto += pv.quantidade * pv.produto.custo;
      totalBruto += pv.total;
    }
  }
  const margem = totalBruto > 0 ? ((totalBruto - totalCusto) / totalBruto) * 100 : 0;

  // ── Evolução Mensal ─────────────────────────────────────────────
  const porMes: Record<string, { total: number; pedidos: number }> = {};
  for (const v of vendas) {
    const [ano, mes] = v.data_venda.split("-");
    const key = `${ano}-${mes}`;
    if (!porMes[key]) porMes[key] = { total: 0, pedidos: 0 };
    porMes[key].total += v.total;
    porMes[key].pedidos += 1;
  }
  const evolucaoMensal = Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const [ano, mes] = key.split("-");
      return {
        mes: key,
        label: new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        total: data.total,
        pedidos: data.pedidos,
      };
    });

  // ── Crescimento último mês ──────────────────────────────────────
  const crescimento =
    evolucaoMensal.length >= 2
      ? ((evolucaoMensal.at(-1)!.total - evolucaoMensal.at(-2)!.total) /
          (evolucaoMensal.at(-2)!.total || 1)) *
        100
      : 0;

  // ── TOP 5 Produtos ──────────────────────────────────────────────
  const prodMap: Record<number, { nome: string; sku: string; quantidade: number; faturamento: number }> = {};
  for (const v of vendas) {
    for (const pv of v.produto_vendas) {
      if (!prodMap[pv.produto_idproduto]) {
        prodMap[pv.produto_idproduto] = {
          nome: pv.produto.nome,
          sku: pv.produto.sku,
          quantidade: 0,
          faturamento: 0,
        };
      }
      prodMap[pv.produto_idproduto].quantidade += pv.quantidade;
      prodMap[pv.produto_idproduto].faturamento += pv.total;
    }
  }
  const topProdutos = Object.values(prodMap)
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 5);

  // ── TOP 5 Clientes (proxy vendedores) ───────────────────────────
  const clienteMap: Record<number, { nome: string; pedidos: number; total: number }> = {};
  for (const v of vendas) {
    if (!clienteMap[v.cliente_idCliente]) {
      clienteMap[v.cliente_idCliente] = { nome: v.cliente.nome, pedidos: 0, total: 0 };
    }
    clienteMap[v.cliente_idCliente].pedidos += 1;
    clienteMap[v.cliente_idCliente].total += v.total;
  }
  const topClientes = Object.values(clienteMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // ── Clientes novos vs recorrentes ───────────────────────────────
  const clienteFreq = Object.values(clienteMap);
  const clientesNovos = clienteFreq.filter((c) => c.pedidos === 1).length;
  const clientesRecorrentes = clienteFreq.filter((c) => c.pedidos > 1).length;

  // ── Vendas por Forma de Pagamento ───────────────────────────────
  const porFormaPagto: Record<string, number> = {};
  for (const v of vendas) {
    porFormaPagto[v.formapagto] = (porFormaPagto[v.formapagto] || 0) + v.total;
  }
  const vendasPorFormaPagto = Object.entries(porFormaPagto)
    .map(([forma, total]) => ({
      forma,
      total,
      percentual: totalFaturamento > 0 ? (total / totalFaturamento) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // ── Vendas por Estado ───────────────────────────────────────────
  const porEstado: Record<string, { total: number; quantidade: number }> = {};
  for (const v of vendas) {
    const estado = v.cliente?.cidade?.estado || "N/A";
    if (!porEstado[estado]) porEstado[estado] = { total: 0, quantidade: 0 };
    porEstado[estado].total += v.total;
    porEstado[estado].quantidade += 1;
  }
  const vendasPorEstado = Object.entries(porEstado)
    .map(([estado, d]) => ({ estado, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // ── Heatmap por dia da semana ───────────────────────────────────
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const heatmapVals = Array(7).fill(0);
  for (const v of vendas) {
    const [ano, mes, dia] = v.data_venda.split("-").map(Number);
    const d = new Date(ano, mes - 1, dia);
    heatmapVals[d.getDay()] += v.total;
  }
  const heatmap = diasSemana.map((dia, i) => ({ dia, total: heatmapVals[i] }));

  // ── Tipos de venda ──────────────────────────────────────────────
  const porTipo: Record<string, number> = {};
  for (const v of vendas) {
    porTipo[v.tipo] = (porTipo[v.tipo] || 0) + 1;
  }

  // ── Insights automáticos ────────────────────────────────────────
  type InsightTipo = "success" | "warning" | "info";
  const insights: { tipo: InsightTipo; icone: string; titulo: string; texto: string }[] = [];

  const metaPercent = totalFaturamento > 0 ? Math.min((totalFaturamento / (totalFaturamento * 1.2)) * 100, 100) : 0;

  if (margem > 30)
    insights.push({ tipo: "success", icone: "📈", titulo: "Margem Saudável", texto: `Margem em ${margem.toFixed(1)}% — acima da média do setor (28%).` });
  else if (margem < 15)
    insights.push({ tipo: "warning", icone: "⚠️", titulo: "Margem Baixa", texto: `Margem em ${margem.toFixed(1)}%. Revise custos dos produtos para recuperar rentabilidade.` });

  if (clientesRecorrentes > clientesNovos)
    insights.push({ tipo: "success", icone: "🔄", titulo: "Alta Retenção", texto: `${clientesRecorrentes} clientes recorrentes — base fidelizada acima do esperado.` });
  else if (clientesNovos > 0)
    insights.push({ tipo: "info", icone: "👥", titulo: "Novos Clientes", texto: `${clientesNovos} novos clientes captados. Implemente régua de relacionamento para aumentar a recorrência.` });

  if (topProdutos.length > 0 && totalBruto > 0)
    insights.push({ tipo: "info", icone: "🏆", titulo: "Produto Líder", texto: `"${topProdutos[0].nome}" é responsável por ${((topProdutos[0].faturamento / totalBruto) * 100).toFixed(1)}% do faturamento.` });

  if (totalDesconto > totalFaturamento * 0.1)
    insights.push({ tipo: "warning", icone: "🏷️", titulo: "Descontos Elevados", texto: `${((totalDesconto / (totalFaturamento + totalDesconto)) * 100).toFixed(1)}% de desconto médio. Avalie a política comercial.` });

  if (crescimento > 10)
    insights.push({ tipo: "success", icone: "🚀", titulo: "Crescimento Acelerado", texto: `Crescimento de +${crescimento.toFixed(1)}% no último período. Tendência positiva sustentada.` });

  if (insights.length === 0)
    insights.push({ tipo: "info", icone: "📊", titulo: "Acompanhe os KPIs", texto: "Registre mais vendas para gerar insights automáticos de desempenho." });

  // ── Previsão próximo mês ────────────────────────────────────────
  const previsaoProximoMes =
    evolucaoMensal.length > 0 ? evolucaoMensal.at(-1)!.total * (1 + crescimento / 100 + 0.05) : 0;

  return {
    kpis: {
      faturamento: { valor: totalFaturamento, meta: totalFaturamento * 1.2, metaPercent },
      pedidos: { valor: totalPedidos },
      ticketMedio: { valor: ticketMedio },
      margem: { valor: margem },
      crescimento: { valor: crescimento },
      clientesNovos: { valor: clientesNovos },
      clientesRecorrentes: { valor: clientesRecorrentes },
      totalDesconto: { valor: totalDesconto },
    },
    evolucaoMensal,
    topProdutos,
    topClientes,
    vendasPorFormaPagto,
    vendasPorEstado,
    heatmap,
    porTipo,
    insights,
    totalProdutos: produtos.length,
    totalClientes,
    previsaoProximoMes,
    totalBruto,
    totalCusto,
  };
}

export type DashboardBIData = Awaited<ReturnType<typeof getDashboardBIData>>;
