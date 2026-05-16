"use client";

import { useState } from "react";
import { ProdutoVenda, ProdutoVendaDialog } from "./produto_venda-dialog";
import { deleteProdutoVenda } from "./actions";
import { Edit2, Plus, Trash2, Tags, Hash } from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutoVendaClient({
  initialData,
  vendas,
  produtos,
}: {
  initialData: ProdutoVenda[];
  vendas: any[];
  produtos: any[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProdutoVenda | null>(null);

  function handleOpenNew() {
    setSelectedItem(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(item: ProdutoVenda) {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }

  async function handleDelete(id: number) {
    if (confirm("Deseja remover este produto da venda?")) {
      await deleteProdutoVenda(id);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Itens da Venda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de produtos vinculados às vendas
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 transition-colors"
        >
          <Plus size={16} /> Adicionar Item
        </button>
      </div>

      <div className="rounded-md border border-border overflow-x-auto bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Venda</th>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium text-center">Qtd</th>
              <th className="px-4 py-3 font-medium text-right">Preço Unit.</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Tags className="h-8 w-8 opacity-20" />
                    <span>Nenhum item cadastrado.</span>
                  </div>
                </td>
              </tr>
            ) : (
              initialData.map((item) => (
                <tr key={item.idproduto_venda} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Venda #{item.venda_idvenda}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.venda?.cliente.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.produto?.nome}</td>
                  <td className="px-4 py-3 text-center">{item.quantidade}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.preco)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenEdit(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.idproduto_venda!)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProdutoVendaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        item={selectedItem}
        vendas={vendas}
        produtos={produtos}
      />
    </div>
  );
}
