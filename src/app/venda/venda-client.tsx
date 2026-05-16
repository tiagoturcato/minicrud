"use client";

import { useState } from "react";
import { Venda, VendaDialog } from "./venda-dialog";
import { deleteVenda } from "./actions";
import {
  Edit2, Plus, Trash2, ShoppingBag, Calendar,
  FileSpreadsheet, FileText, Download,
} from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// ── Exportar CSV ──────────────────────────────────────────────────
function exportarCSV(vendas: Venda[]) {
  const cabecalho = ["ID", "Data", "Cliente", "Tipo", "Pagamento", "Desconto (R$)", "Total (R$)"];
  const linhas = vendas.map((v) => [
    v.idvenda,
    formatDate(v.data_venda),
    `"${v.cliente?.nome ?? ""}"`,
    v.tipo,
    `"${v.formapagto}"`,
    v.desconto.toFixed(2).replace(".", ","),
    v.total.toFixed(2).replace(".", ","),
  ]);

  const conteudo = [cabecalho, ...linhas].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vendas_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Exportar PDF (via print do browser) ──────────────────────────
function exportarPDF(vendas: Venda[]) {
  const totalGeral = vendas.reduce((s, v) => s + v.total, 0);
  const totalDesconto = vendas.reduce((s, v) => s + v.desconto, 0);
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const linhas = vendas.map((v) => `
    <tr>
      <td>${v.idvenda}</td>
      <td>${formatDate(v.data_venda)}</td>
      <td>${v.cliente?.nome ?? ""}</td>
      <td><span class="badge badge-${v.tipo.toLowerCase()}">${v.tipo}</span></td>
      <td>${v.formapagto}</td>
      <td class="red">${v.desconto > 0 ? `-${formatCurrency(v.desconto)}` : "-"}</td>
      <td class="bold green">${formatCurrency(v.total)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Vendas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #111; padding-bottom: 12px; }
    header h1 { font-size: 22px; font-weight: 700; }
    header p { font-size: 11px; color: #555; margin-top: 4px; }
    .meta { text-align: right; font-size: 11px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead { background-color: #1e293b; color: white; }
    th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .bold { font-weight: 700; }
    .red { color: #dc2626; }
    .green { color: #16a34a; }
    .badge { padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 700; }
    .badge-pv { background: #dcfce7; color: #15803d; }
    .badge-nf { background: #dbeafe; color: #1d4ed8; }
    .badge-or { background: #f1f5f9; color: #475569; }
    tfoot td { font-weight: 700; background: #f8fafc; padding: 10px; border-top: 2px solid #1e293b; }
    .totais-box { display: flex; gap: 24px; justify-content: flex-end; background: #1e293b; color: white; border-radius: 8px; padding: 14px 20px; margin-bottom: 16px; }
    .totais-box .item { text-align: right; }
    .totais-box .label { font-size: 10px; opacity: 0.7; }
    .totais-box .value { font-size: 16px; font-weight: 700; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Relatório de Vendas</h1>
      <p>${vendas.length} venda${vendas.length !== 1 ? "s" : ""} encontrada${vendas.length !== 1 ? "s" : ""}</p>
    </div>
    <div class="meta">
      <p>Emitido em ${hoje}</p>
    </div>
  </header>

  <div class="totais-box">
    <div class="item">
      <div class="label">TOTAL DE VENDAS</div>
      <div class="value">${vendas.length}</div>
    </div>
    <div class="item">
      <div class="label">TOTAL DE DESCONTOS</div>
      <div class="value" style="color:#fca5a5">-${formatCurrency(totalDesconto)}</div>
    </div>
    <div class="item">
      <div class="label">FATURAMENTO TOTAL</div>
      <div class="value" style="color:#86efac">${formatCurrency(totalGeral)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Data</th>
        <th>Cliente</th>
        <th>Tipo</th>
        <th>Pagamento</th>
        <th>Desconto</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${linhas}
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── Componente principal ──────────────────────────────────────────
export default function VendaClient({
  initialData,
  clientes,
}: {
  initialData: Venda[];
  clientes: any[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  function handleOpenNew() {
    setSelectedVenda(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(venda: Venda) {
    setSelectedVenda(venda);
    setIsDialogOpen(true);
  }

  async function handleDelete(idvenda: number) {
    if (confirm("Tem certeza que deseja excluir esta venda?")) {
      await deleteVenda(idvenda);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData.length} venda{initialData.length !== 1 ? "s" : ""}{" "}
            realizada{initialData.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Exportar CSV */}
          <button
            onClick={() => exportarCSV(initialData)}
            disabled={initialData.length === 0}
            title="Exportar para Excel/CSV"
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FileSpreadsheet size={15} className="text-green-600" />
            <span className="hidden sm:inline">Excel/CSV</span>
            <Download size={13} className="opacity-50" />
          </button>

          {/* Exportar PDF */}
          <button
            onClick={() => exportarPDF(initialData)}
            disabled={initialData.length === 0}
            title="Exportar para PDF"
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FileText size={15} className="text-red-500" />
            <span className="hidden sm:inline">PDF</span>
            <Download size={13} className="opacity-50" />
          </button>

          {/* Nova Venda */}
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 transition-colors"
          >
            <Plus size={16} /> Nova Venda
          </button>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-x-auto bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium text-center">Tipo</th>
              <th className="px-4 py-3 font-medium">Pagamento</th>
              <th className="px-4 py-3 font-medium text-right">Desconto</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingBag className="h-8 w-8 opacity-20" />
                    <span>Nenhuma venda registrada.</span>
                  </div>
                </td>
              </tr>
            ) : (
              initialData.map((venda) => (
                <tr
                  key={venda.idvenda}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-muted-foreground" />
                      {formatDate(venda.data_venda)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{venda.cliente?.nome}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      venda.tipo === "NF" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      venda.tipo === "PV" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {venda.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{venda.formapagto}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-500">
                    {venda.desconto > 0 ? `-${formatCurrency(venda.desconto)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold">
                    {formatCurrency(venda.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(venda)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(venda.idvenda!)}
                        className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <VendaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        venda={selectedVenda}
        clientes={clientes}
      />
    </div>
  );
}
