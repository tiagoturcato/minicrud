"use client";

import { useState, useEffect } from "react";
import { saveCidade } from "./actions";
import { X } from "lucide-react";

export type Cidade = {
  idcidade?: number;
  nome: string;
  estado: string;
};

interface CidadeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cidade?: Cidade | null;
}

export function CidadeDialog({ isOpen, onClose, cidade }: CidadeDialogProps) {
  const [nome, setNome] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNome(cidade?.nome || "");
      setEstado(cidade?.estado || "");
    }
  }, [isOpen, cidade]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await saveCidade({
      idcidade: cidade?.idcidade,
      nome,
      estado,
    });
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {cidade ? "Alterar Cidade" : "Nova Cidade"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-1">
              Nome da Cidade
            </label>
            <input
              id="nome"
              type="text"
              required
              maxLength={45}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Ex: São Paulo"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium mb-1">
              Estado (UF)
            </label>
            <input
              id="estado"
              type="text"
              required
              maxLength={2}
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring uppercase"
              placeholder="Ex: SP"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
