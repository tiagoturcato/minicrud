"use client";

import { useState } from "react";
import { Venda, VendaDialog } from "./venda-dialog";
import { deleteVenda } from "./actions";
import { Edit2, Plus, Trash2, ShoppingBag, Receipt, Calendar } from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

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
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 transition-colors"
        >
          <Plus size={16} /> Nova Venda
        </button>
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
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
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
                      venda.tipo === 'NF' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      venda.tipo === 'PV' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
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
