"use client";

import { useState, useEffect } from "react";
import { saveVenda } from "./actions";
import { X, Search, Check, ChevronDown } from "lucide-react";

export type Venda = {
  idvenda?: number;
  data_venda: string;
  cliente_idCliente: number;
  tipo: string;
  formapagto: string;
  desconto: number;
  total: number;
  cliente?: {
    nome: string;
  };
};

interface Cliente {
  idCliente: number;
  nome: string;
}

interface VendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  venda?: Venda | null;
  clientes: Cliente[];
}

export function VendaDialog({ isOpen, onClose, venda, clientes }: VendaDialogProps) {
  const [form, setForm] = useState({
    data_venda: new Date().toISOString().split("T")[0],
    cliente_idCliente: "",
    tipo: "PV", // PV = Pedido de Venda, NF = Nota Fiscal, etc.
    formapagto: "Dinheiro",
    desconto: "0",
    total: "0",
  });
  const [loading, setLoading] = useState(false);
  const [showClienteSelect, setShowClienteSelect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({
        data_venda: venda?.data_venda || new Date().toISOString().split("T")[0],
        cliente_idCliente: venda?.cliente_idCliente?.toString() || "",
        tipo: venda?.tipo || "PV",
        formapagto: venda?.formapagto || "Dinheiro",
        desconto: venda?.desconto?.toString() || "0",
        total: venda?.total?.toString() || "0",
      });
      setSearchTerm("");
    }
  }, [isOpen, venda]);

  if (!isOpen) return null;

  const filteredClientes = clientes.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCliente = clientes.find((c) => c.idCliente.toString() === form.cliente_idCliente);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente_idCliente) {
      alert("Por favor, selecione um cliente.");
      return;
    }
    setLoading(true);
    await saveVenda({
      idvenda: venda?.idvenda,
      data_venda: form.data_venda,
      cliente_idCliente: parseInt(form.cliente_idCliente),
      tipo: form.tipo,
      formapagto: form.formapagto,
      desconto: parseFloat(form.desconto),
      total: parseFloat(form.total),
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
            {venda ? "Alterar Venda" : "Nova Venda"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Data */}
            <div>
              <label className={labelClass}>Data *</label>
              <input
                type="date"
                name="data_venda"
                required
                value={form.data_venda}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            {/* Tipo */}
            <div>
              <label className={labelClass}>Tipo *</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="PV">Pedido de Venda</option>
                <option value="NF">Nota Fiscal</option>
                <option value="OR">Orçamento</option>
              </select>
            </div>
          </div>

          {/* Cliente Selector (Custom Combobox) */}
          <div className="relative">
            <label className={labelClass}>Cliente *</label>
            <button
              type="button"
              onClick={() => setShowClienteSelect(!showClienteSelect)}
              className={`${inputClass} flex items-center justify-between text-left`}
            >
              <span className={selectedCliente ? "" : "text-muted-foreground"}>
                {selectedCliente ? selectedCliente.nome : "Selecione um cliente..."}
              </span>
              <ChevronDown size={16} className="opacity-50" />
            </button>

            {showClienteSelect && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none">
                <div className="flex items-center border-b border-border px-3 py-2">
                  <Search size={16} className="mr-2 opacity-50" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredClientes.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      Nenhum cliente encontrado.
                    </div>
                  ) : (
                    filteredClientes.map((cliente) => (
                      <button
                        key={cliente.idCliente}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, cliente_idCliente: cliente.idCliente.toString() }));
                          setShowClienteSelect(false);
                        }}
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        {cliente.nome}
                        {form.cliente_idCliente === cliente.idCliente.toString() && (
                          <Check size={14} className="text-primary" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Forma de Pagamento */}
            <div>
              <label className={labelClass}>Forma de Pagto *</label>
              <select
                name="formapagto"
                value={form.formapagto}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="PIX">PIX</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
            {/* Desconto */}
            <div>
              <label className={labelClass}>Desconto (R$)</label>
              <input
                type="number"
                name="desconto"
                step="0.01"
                min="0"
                value={form.desconto}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Total */}
          <div>
            <label className={labelClass}>Valor Total (R$) *</label>
            <input
              type="number"
              name="total"
              required
              step="0.01"
              min="0"
              value={form.total}
              onChange={handleChange}
              className={`${inputClass} text-lg font-bold text-slate-900 dark:text-slate-50 bg-slate-100 dark:bg-slate-800`}
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
