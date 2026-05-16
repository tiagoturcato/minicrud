"use client";

import { useState } from "react";
import { Cidade, CidadeDialog } from "./cidade-dialog";
import { deleteCidade } from "./actions";
import { Edit2, Plus, Trash2 } from "lucide-react";

export default function CidadeClient({ initialData }: { initialData: Cidade[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);

  function handleOpenNew() {
    setSelectedCidade(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(cidade: Cidade) {
    setSelectedCidade(cidade);
    setIsDialogOpen(true);
  }

  async function handleDelete(idcidade: number) {
    if (confirm("Tem certeza que deseja excluir esta cidade?")) {
      await deleteCidade(idcidade);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cidades</h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
        >
          <Plus size={16} /> Nova Cidade
        </button>
      </div>

      <div className="rounded-md border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma cidade cadastrada.
                </td>
              </tr>
            ) : (
              initialData.map((cidade) => (
                <tr key={cidade.idcidade} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">{cidade.idcidade}</td>
                  <td className="px-4 py-3 font-medium">{cidade.nome}</td>
                  <td className="px-4 py-3">{cidade.estado}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cidade)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cidade.idcidade!)}
                        className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
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

      <CidadeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        cidade={selectedCidade}
      />
    </div>
  );
}
