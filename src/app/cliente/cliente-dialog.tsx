"use client";

import { useState, useEffect, useRef } from "react";
import { saveCliente } from "./actions";
import { X, ChevronDown, Search, Check } from "lucide-react";

export type Cidade = {
  idcidade: number;
  nome: string;
  estado: string;
};

export type Cliente = {
  idCliente?: number;
  nome: string;
  cpf: string;
  endereco: string;
  numero: number;
  complemento?: string | null;
  bairro: string;
  cidade_idcidade: number;
  dtnasc?: string | null;
  salario?: number | null;
  ativo: number;
  cidade?: Cidade;
};

interface ClienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
  cidades: Cidade[];
}

function applyCpfMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function CidadeCombobox({
  cidades,
  value,
  onChange,
}: {
  cidades: Cidade[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedCidade = cidades.find((c) => c.idcidade.toString() === value);

  const filtered = cidades.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.estado.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) setSearch("");
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className={selectedCidade ? "text-foreground" : "text-muted-foreground"}>
          {selectedCidade
            ? `${selectedCidade.nome} / ${selectedCidade.estado}`
            : "Selecione uma cidade..."}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-border bg-background shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cidade..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Nenhuma cidade encontrada.
              </li>
            ) : (
              filtered.map((c) => (
                <li
                  key={c.idcidade}
                  onClick={() => {
                    onChange(c.idcidade.toString());
                    setOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    value === c.idcidade.toString()
                      ? "bg-slate-100 font-medium dark:bg-slate-800"
                      : ""
                  }`}
                >
                  <span>
                    {c.nome}{" "}
                    <span className="text-muted-foreground">/ {c.estado}</span>
                  </span>
                  {value === c.idcidade.toString() && (
                    <Check size={14} className="text-primary" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ClienteDialog({
  isOpen,
  onClose,
  cliente,
  cidades,
}: ClienteDialogProps) {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade_idcidade: "",
    dtnasc: "",
    salario: "",
    ativo: "1",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        nome: cliente?.nome || "",
        cpf: cliente?.cpf || "",
        endereco: cliente?.endereco || "",
        numero: cliente?.numero?.toString() || "",
        complemento: cliente?.complemento || "",
        bairro: cliente?.bairro || "",
        cidade_idcidade: cliente?.cidade_idcidade?.toString() || "",
        dtnasc: cliente?.dtnasc || "",
        salario: cliente?.salario?.toString() || "",
        ativo: cliente?.ativo?.toString() ?? "1",
      });
    }
  }, [isOpen, cliente]);

  if (!isOpen) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (name === "cpf") {
      setForm((prev) => ({ ...prev, cpf: applyCpfMask(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await saveCliente({
      idCliente: cliente?.idCliente,
      nome: form.nome,
      cpf: form.cpf,
      endereco: form.endereco,
      numero: parseInt(form.numero),
      complemento: form.complemento || undefined,
      bairro: form.bairro,
      cidade_idcidade: parseInt(form.cidade_idcidade),
      dtnasc: form.dtnasc || undefined,
      salario: form.salario ? parseFloat(form.salario) : null,
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
      <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">
            {cliente ? "Alterar Cliente" : "Novo Cliente"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e CPF */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nome *</label>
              <input
                type="text"
                name="nome"
                required
                maxLength={100}
                value={form.nome}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className={labelClass}>CPF *</label>
              <input
                type="text"
                name="cpf"
                required
                maxLength={14}
                value={form.cpf}
                onChange={handleChange}
                className={inputClass}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          {/* Endereço e Número */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Endereço *</label>
              <input
                type="text"
                name="endereco"
                required
                maxLength={100}
                value={form.endereco}
                onChange={handleChange}
                className={inputClass}
                placeholder="Rua, Avenida..."
              />
            </div>
            <div>
              <label className={labelClass}>Número *</label>
              <input
                type="number"
                name="numero"
                required
                min={0}
                value={form.numero}
                onChange={handleChange}
                className={inputClass}
                placeholder="123"
              />
            </div>
          </div>

          {/* Complemento e Bairro */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Complemento</label>
              <input
                type="text"
                name="complemento"
                maxLength={30}
                value={form.complemento}
                onChange={handleChange}
                className={inputClass}
                placeholder="Apto, Bloco..."
              />
            </div>
            <div>
              <label className={labelClass}>Bairro *</label>
              <input
                type="text"
                name="bairro"
                required
                maxLength={45}
                value={form.bairro}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nome do bairro"
              />
            </div>
          </div>

          {/* Cidade — Combobox customizado */}
          <div>
            <label className={labelClass}>Cidade *</label>
            <CidadeCombobox
              cidades={cidades}
              value={form.cidade_idcidade}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, cidade_idcidade: val }))
              }
            />
            <input
              type="text"
              name="cidade_idcidade"
              required
              value={form.cidade_idcidade}
              readOnly
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
          </div>

          {/* Data Nasc, Salário e Ativo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Data de Nascimento</label>
              <input
                type="date"
                name="dtnasc"
                value={form.dtnasc}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Salário</label>
              <input
                type="number"
                name="salario"
                step="0.01"
                min="0"
                value={form.salario}
                onChange={handleChange}
                className={inputClass}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className={labelClass}>Situação *</label>
              <select
                name="ativo"
                value={form.ativo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>
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
