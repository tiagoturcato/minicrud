"use client";

import { DashboardBIData } from "./actions";
import { VChart } from "@visactor/react-vchart";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, Target, Award, BarChart3, Zap, AlertTriangle, Info
} from "lucide-react";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtN = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });


// Paleta com máximo contraste — cada cor é visualmente distinta
const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Esmeralda
  "#f59e0b", // Âmbar
  "#ef4444", // Vermelho
  "#0ea5e9", // Azul-céu
  "#ec4899", // Rosa
  "#f97316", // Laranja
  "#84cc16", // Lima
];

// Cores específicas para o gráfico de pizza/donut (muito distintas)
const DONUT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899"];

// Cores para barras com gradiente de intensidade fácil de ler
const BAR_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

// ── Glass Card ──────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "16px",
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      padding: "20px",
    }}>{children}</div>
  );
}

// ── KPI Card ────────────────────────────────────────────────────────
function KPICard({ icon: Icon, title, value, sub, color, positive }: any) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{title}</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>{value}</p>
          {sub && (
            <p style={{ fontSize: 12, color: positive === true ? "#10b981" : positive === false ? "#ef4444" : "#94a3b8", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
              {positive === true && <TrendingUp size={12} />}
              {positive === false && <TrendingDown size={12} />}
              {sub}
            </p>
          )}
        </div>
        <div style={{ background: `${color}22`, borderRadius: 12, padding: 10 }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </Card>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────
function ProgressBar({ value, max, color = "#6366f1" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, background: color, borderRadius: 99, height: "100%", transition: "width 1s ease" }} />
    </div>
  );
}

// ── Insight Card ─────────────────────────────────────────────────────
function InsightCard({ tipo, icone, titulo, texto }: any) {
  const colors = { success: "#10b981", warning: "#f59e0b", info: "#6366f1" };
  const color = colors[tipo as keyof typeof colors];
  return (
    <div style={{
      background: `${color}11`,
      border: `1px solid ${color}33`,
      borderRadius: 12, padding: "14px 16px",
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 20 }}>{icone}</span>
      <div>
        <p style={{ fontWeight: 700, fontSize: 13, color, margin: 0 }}>{titulo}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>{texto}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function BIClient({ data }: { data: DashboardBIData }) {
  const { kpis, evolucaoMensal, topProdutos, topClientes, vendasPorFormaPagto, vendasPorEstado, heatmap, insights, previsaoProximoMes } = data;

  // ── Filtro de período ──────────────────────────────────────────
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "3m" | "Ano" | "Tudo">("Tudo");

  const evolucaoFiltrada = (() => {
    if (periodo === "Tudo" || evolucaoMensal.length === 0) return evolucaoMensal;
    const agora = new Date();
    const limites: Record<string, number> = { "7d": 7, "30d": 30, "3m": 90, "Ano": 365 };
    const diasAtras = limites[periodo] ?? 9999;
    const limite = new Date(agora.getTime() - diasAtras * 86400000);
    return evolucaoMensal.filter(m => {
      const [ano, mes] = m.mes.split("-").map(Number);
      return new Date(ano, mes - 1, 1) >= limite;
    });
  })();
  const lineSpec = {
    type: "line",
    background: "transparent",
    data: [{ values: evolucaoFiltrada.length > 0 ? evolucaoFiltrada : [{ label: "Sem dados", total: 0 }] }],
    xField: "label", yField: "total",
    line: { style: { stroke: "#6366f1", lineWidth: 2 } },
    point: { visible: true, style: { fill: "#6366f1", size: 6 } },
    area: { visible: true, style: { fill: "l(270) 0:#6366f100 1:#6366f144" } },
    axes: [
      { orient: "bottom", label: { style: { fill: "#64748b", fontSize: 11 } }, domainLine: { visible: false }, tick: { visible: false } },
      { orient: "left", label: { style: { fill: "#64748b", fontSize: 11 }, formatMethod: (v: number) => `R$${(v/1000).toFixed(0)}k` }, grid: { style: { stroke: "#ffffff11" } }, domainLine: { visible: false }, tick: { visible: false } },
    ],
  } as any;

  // Chart: Ranking produtos (barra horizontal)
  const barSpec = {
    type: "bar",
    direction: "horizontal",
    background: "transparent",
    data: [{ values: topProdutos.slice(0, 5).map((p, i) => ({ nome: p.nome.substring(0, 22), faturamento: p.faturamento, index: i })) }],
    xField: "faturamento", yField: "nome",
    color: BAR_COLORS,
    bar: { style: { cornerRadius: [0, 6, 6, 0] } },
    axes: [
      { orient: "left", label: { style: { fill: "#94a3b8", fontSize: 11 } }, domainLine: { visible: false }, tick: { visible: false } },
      { orient: "bottom", label: { style: { fill: "#64748b", fontSize: 10 }, formatMethod: (v: number) => `R$${(v/1000).toFixed(0)}k` }, grid: { style: { stroke: "#ffffff11" } }, domainLine: { visible: false }, tick: { visible: false } },
    ],
  } as any;

  // Chart: Vendas por pagamento (donut) — color array no nível raiz
  const donutSpec = {
    type: "pie",
    background: "transparent",
    color: DONUT_COLORS,
    data: [{ values: vendasPorFormaPagto.length > 0 ? vendasPorFormaPagto.map(v => ({ x: v.forma, y: Number(v.total.toFixed(2)) })) : [{ x: "Sem dados", y: 1 }] }],
    categoryField: "x",
    valueField: "y",
    outerRadius: 0.82,
    innerRadius: 0.60,
    label: { visible: false },
    legends: {
      visible: true,
      orient: "bottom",
      item: { label: { style: { fill: "#94a3b8", fontSize: 11 } } },
    },
  } as any;

  // Chart: Vendas por estado (barra)
  const estadoSpec = {
    type: "bar",
    background: "transparent",
    data: [{ values: vendasPorEstado.length > 0 ? vendasPorEstado.map((e, i) => ({ estado: e.estado, total: e.total, index: i })) : [{ estado: "N/A", total: 0, index: 0 }] }],
    xField: "estado", yField: "total",
    color: COLORS,
    bar: { style: { cornerRadius: [6, 6, 0, 0] } },
    axes: [
      { orient: "bottom", label: { style: { fill: "#94a3b8", fontSize: 11 } }, domainLine: { visible: false }, tick: { visible: false } },
      { orient: "left", label: { style: { fill: "#64748b", fontSize: 10 }, formatMethod: (v: number) => `R$${(v/1000).toFixed(0)}k` }, grid: { style: { stroke: "#ffffff11" } }, domainLine: { visible: false }, tick: { visible: false } },
    ],
  } as any;

  const bg = { background: "#0a0c14", minHeight: "100vh", color: "#f1f5f9" };
  const grid4 = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 };
  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
  const grid3 = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 };

  return (
    <div style={bg}>
      {/* Header */}
      <div style={{ background: "rgba(99,102,241,0.08)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BarChart3 size={22} color="#6366f1" />
            <h1 style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
              Sales Intelligence
            </h1>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Dashboard executivo · Dados em tempo real</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["7d", "30d", "3m", "Ano", "Tudo"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${periodo === p ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
                background: periodo === p ? "#6366f1" : "transparent",
                color: periodo === p ? "#fff" : "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* KPI Row 1 */}
        <div style={grid4}>
          <KPICard icon={DollarSign} title="Faturamento Total" value={fmt(kpis.faturamento.valor)} sub={`Meta: ${fmtN(kpis.faturamento.metaPercent)}% atingida`} color="#6366f1" positive={kpis.faturamento.metaPercent >= 80} />
          <KPICard icon={ShoppingCart} title="Total de Pedidos" value={kpis.pedidos.valor} sub="pedidos registrados" color="#8b5cf6" />
          <KPICard icon={Target} title="Ticket Médio" value={fmt(kpis.ticketMedio.valor)} sub="por venda" color="#06b6d4" />
          <KPICard icon={TrendingUp} title="Margem de Lucro" value={`${fmtN(kpis.margem.valor)}%`} sub={kpis.margem.valor >= 25 ? "Saudável" : "Atenção necessária"} color="#10b981" positive={kpis.margem.valor >= 25} />
        </div>

        {/* KPI Row 2 */}
        <div style={grid4}>
          <KPICard icon={TrendingUp} title="Crescimento" value={`${kpis.crescimento.valor >= 0 ? "+" : ""}${fmtN(kpis.crescimento.valor)}%`} sub="vs período anterior" color={kpis.crescimento.valor >= 0 ? "#10b981" : "#ef4444"} positive={kpis.crescimento.valor >= 0} />
          <KPICard icon={Users} title="Clientes Novos" value={kpis.clientesNovos.valor} sub="primeira compra" color="#f59e0b" />
          <KPICard icon={Award} title="Clientes Recorrentes" value={kpis.clientesRecorrentes.valor} sub="compras repetidas" color="#ec4899" positive />
          <KPICard icon={Zap} title="Total Descontos" value={fmt(kpis.totalDesconto.valor)} sub="concedidos" color="#ef4444" positive={kpis.totalDesconto.valor < kpis.faturamento.valor * 0.1} />
        </div>

        {/* Meta vs Realizado */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", margin: 0 }}>Meta vs Realizado</p>
            <span style={{ fontSize: 12, color: kpis.faturamento.metaPercent >= 80 ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
              {fmtN(kpis.faturamento.metaPercent)}%
            </span>
          </div>
          <ProgressBar value={kpis.faturamento.valor} max={kpis.faturamento.meta} color={kpis.faturamento.metaPercent >= 80 ? "#10b981" : "#f59e0b"} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#64748b" }}>
            <span>Realizado: {fmt(kpis.faturamento.valor)}</span>
            <span>Meta: {fmt(kpis.faturamento.meta)}</span>
          </div>
        </Card>

        {/* Gráficos linha + donut */}
        <div style={grid3}>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 16, marginTop: 0 }}>📈 Evolução de Vendas</p>
            {evolucaoFiltrada.length > 0 ? (
              <VChart spec={lineSpec} style={{ height: 240 }} />
            ) : (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>Sem dados para o período selecionado</div>
            )}
          </Card>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 8, marginTop: 0 }}>💳 Vendas por Canal</p>
            <VChart spec={donutSpec} style={{ height: 256 }} />
          </Card>
        </div>

        {/* Ranking produtos + clientes */}
        <div style={grid2}>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 16, marginTop: 0 }}>🏆 Top 5 Produtos</p>
            {topProdutos.length > 0 ? (
              <VChart spec={barSpec} style={{ height: 220 }} />
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>Nenhum item de venda registrado</div>
            )}
          </Card>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 12, marginTop: 0 }}>👑 Top 5 Clientes</p>
            {topClientes.length > 0 ? topClientes.map((c, i) => {
              const maxTotal = topClientes[0].total;
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, width: 18, height: 18, borderRadius: 99, background: COLORS[i], color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{i + 1}</span>
                      {c.nome}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i] }}>{fmt(c.total)}</span>
                  </div>
                  <ProgressBar value={c.total} max={maxTotal} color={COLORS[i]} />
                </div>
              );
            }) : <p style={{ color: "#475569", fontSize: 13 }}>Sem dados</p>}
          </Card>
        </div>

        {/* Região + Heatmap */}
        <div style={grid3}>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 16, marginTop: 0 }}>🗺️ Vendas por Região (Estado)</p>
            {vendasPorEstado.length > 0 ? (
              <VChart spec={estadoSpec} style={{ height: 220 }} />
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>Sem dados de região</div>
            )}
          </Card>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 16, marginTop: 0 }}>📅 Heatmap Semanal</p>
            {heatmap.map((h, i) => {
              const maxH = Math.max(...heatmap.map(x => x.total), 1);
              const intensity = h.total / maxH;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 32, fontSize: 12, color: "#64748b", textAlign: "right", flexShrink: 0 }}>{h.dia}</span>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 24, overflow: "hidden" }}>
                    <div style={{ width: `${intensity * 100}%`, height: "100%", background: `rgba(99,102,241,${0.2 + intensity * 0.8})`, borderRadius: 6, transition: "width 1s" }} />
                  </div>
                  <span style={{ width: 70, fontSize: 11, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>{h.total > 0 ? fmt(h.total) : "–"}</span>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Insights + Previsão */}
        <div style={grid2}>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 16, marginTop: 0 }}>🤖 Insights de IA</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>
          </Card>
          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 16, marginTop: 0 }}>🔮 Previsão de Faturamento</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "linear-gradient(135deg,#6366f122,#8b5cf622)", border: "1px solid #6366f144", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Próximo Período</p>
                <p style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg,#6366f1,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                  {fmt(previsaoProximoMes)}
                </p>
                <p style={{ fontSize: 12, color: "#64748b", margin: "8px 0 0" }}>Baseado na tendência atual +5%</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase" }}>Cenário Pessimista</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#ef4444", margin: 0 }}>{fmt(previsaoProximoMes * 0.8)}</p>
                </div>
                <div style={{ flex: 1, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 4px", textTransform: "uppercase" }}>Cenário Otimista</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#10b981", margin: 0 }}>{fmt(previsaoProximoMes * 1.2)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
