"use client";

import { useState, useEffect } from "react";
import { saveProduto } from "./actions";
import { X } from "lucide-react";

export type Produto = {
  idproduto?: number;
  nome: string;
  sku: string;
  preco_venda: number;
  custo: number;
  ativo: number;
};

interface ProdutoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: Produto | null;
}

export function ProdutoDialog({ isOpen, onClose, produto }: ProdutoDialogProps) {
  const [form, setForm] = useState({
    nome: "",
    sku: "",
    preco_venda: "",
    custo: "",
    ativo: "1",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        nome: produto?.nome || "",
        sku: produto?.sku || "",
        preco_venda: produto?.preco_venda?.toString() || "",
        custo: produto?.custo?.toString() || "",
        ativo: produto?.ativo?.toString() ?? "1",
      });
    }
  }, [isOpen, produto]);

  if (!isOpen) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await saveProduto({
      idproduto: produto?.idproduto,
      nome: form.nome,
      sku: form.sku,
      preco_venda: parseFloat(form.preco_venda),
      custo: parseFloat(form.custo),
      ativo: parseInt(form.ativo),
    });
    setLoading(false);
    onClose();
  }

  const inputClass =
    "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">
            {produto ? "Alterar Produto" : "Novo Produto"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className={labelClass}>Nome *</label>
            <input
              type="text"
              name="nome"
              required
              maxLength={45}
              value={form.nome}
              onChange={handleChange}
              className={inputClass}
              placeholder="Nome do produto"
            />
          </div>

          {/* SKU */}
          <div>
            <label className={labelClass}>SKU *</label>
            <input
              type="text"
              name="sku"
              required
              maxLength={45}
              value={form.sku}
              onChange={handleChange}
              className={inputClass}
              placeholder="Código SKU"
            />
          </div>

          {/* Preço de Venda e Custo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Preço de Venda *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <input
                  type="number"
                  name="preco_venda"
                  required
                  step="0.01"
                  min="0"
                  value={form.preco_venda}
                  onChange={handleChange}
                  className={`${inputClass} pl-9`}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Custo *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  R$
                </span>
                <input
                  type="number"
                  name="custo"
                  required
                  step="0.01"
                  min="0"
                  value={form.custo}
                  onChange={handleChange}
                  className={`${inputClass} pl-9`}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Margem calculada (display apenas) */}
          {form.preco_venda && form.custo && parseFloat(form.preco_venda) > 0 && (
            <div className="rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm">
              <span className="text-muted-foreground">Margem: </span>
              <span className="font-semibold">
                {(
                  ((parseFloat(form.preco_venda) - parseFloat(form.custo)) /
                    parseFloat(form.preco_venda)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          )}

          {/* Situação */}
          <div>
            <label className={labelClass}>Situação *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, ativo: "1" }))}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-all ${
                  form.ativo === "1"
                    ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400"
                    : "border-border bg-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Ativo
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, ativo: "0" }))}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-all ${
                  form.ativo === "0"
                    ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                    : "border-border bg-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Inativo
              </button>
            </div>
            {/* Campo hidden para manter a lógica do form se necessário */}
            <input type="hidden" name="ativo" value={form.ativo} />
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
