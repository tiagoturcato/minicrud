"use client";

import { useState } from "react";
import { Produto, ProdutoDialog } from "./produto-dialog";
import { deleteProduto } from "./actions";
import { Edit2, Plus, Trash2, CheckCircle, XCircle, Package } from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutoClient({
  initialData,
}: {
  initialData: Produto[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  function handleOpenNew() {
    setSelectedProduto(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(produto: Produto) {
    setSelectedProduto(produto);
    setIsDialogOpen(true);
  }

  async function handleDelete(idproduto: number) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduto(idproduto);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData.length} produto{initialData.length !== 1 ? "s" : ""}{" "}
            cadastrado{initialData.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 transition-colors"
        >
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="rounded-md border border-border overflow-x-auto bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium text-right">Preço Venda</th>
              <th className="px-4 py-3 font-medium text-right">Custo</th>
              <th className="px-4 py-3 font-medium text-center">Ativo</th>
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
                    <Package className="h-8 w-8 opacity-20" />
                    <span>Nenhum produto cadastrado.</span>
                  </div>
                </td>
              </tr>
            ) : (
              initialData.map((produto) => (
                <tr
                  key={produto.idproduto}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground">{produto.idproduto}</td>
                  <td className="px-4 py-3 font-medium">{produto.nome}</td>
                  <td className="px-4 py-3 font-mono text-xs">{produto.sku}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(produto.preco_venda)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(produto.custo)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {produto.ativo === 1 ? (
                      <CheckCircle
                        size={16}
                        className="inline text-green-500"
                      />
                    ) : (
                      <XCircle size={16} className="inline text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(produto)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.idproduto!)}
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

      <ProdutoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        produto={selectedProduto}
      />
    </div>
  );
}
