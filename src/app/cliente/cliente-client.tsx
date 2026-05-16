"use client";

import { useState } from "react";
import { Cliente, ClienteDialog, Cidade } from "./cliente-dialog";
import { deleteCliente } from "./actions";
import { Edit2, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";

function formatCpf(cpf: string) {
  return cpf;
}

function formatSalario(value: number | null | undefined) {
  if (value == null) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatData(value: string | null | undefined) {
  if (!value) return "-";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

export default function ClienteClient({
  initialData,
  cidades,
}: {
  initialData: Cliente[];
  cidades: Cidade[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  function handleOpenNew() {
    setSelectedCliente(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(cliente: Cliente) {
    setSelectedCliente(cliente);
    setIsDialogOpen(true);
  }

  async function handleDelete(idCliente: number) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      await deleteCliente(idCliente);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {initialData.length} registro{initialData.length !== 1 ? "s" : ""}{" "}
            encontrado{initialData.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      <div className="rounded-md border border-border overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">CPF</th>
              <th className="px-4 py-3 font-medium">Cidade</th>
              <th className="px-4 py-3 font-medium">Bairro</th>
              <th className="px-4 py-3 font-medium">Dt. Nasc.</th>
              <th className="px-4 py-3 font-medium">Salário</th>
              <th className="px-4 py-3 font-medium text-center">Ativo</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialData.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              initialData.map((cliente) => (
                <tr
                  key={cliente.idCliente}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">{cliente.idCliente}</td>
                  <td className="px-4 py-3 font-medium">{cliente.nome}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCpf(cliente.cpf)}</td>
                  <td className="px-4 py-3">
                    {cliente.cidade
                      ? `${cliente.cidade.nome} / ${cliente.cidade.estado}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{cliente.bairro}</td>
                  <td className="px-4 py-3">{formatData(cliente.dtnasc)}</td>
                  <td className="px-4 py-3">{formatSalario(cliente.salario)}</td>
                  <td className="px-4 py-3 text-center">
                    {cliente.ativo === 1 ? (
                      <CheckCircle
                        size={16}
                        className="inline text-green-500"
                      />
                    ) : (
                      <XCircle size={16} className="inline text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(cliente)}
                        className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.idCliente!)}
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

      <ClienteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        cliente={selectedCliente}
        cidades={cidades}
      />
    </div>
  );
}
