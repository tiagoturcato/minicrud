"use client";

import { useState, useEffect } from "react";
import { saveProdutoVenda } from "./actions";
import { X, Search, Check, ChevronDown } from "lucide-react";

export type ProdutoVenda = {
  idproduto_venda?: number;
  quantidade: number;
  preco: number;
  total: number;
  venda_idvenda: number;
  venda_cliente_idCliente: number;
  produto_idproduto: number;
  venda?: {
    idvenda: number;
    cliente: { nome: string };
  };
  produto?: {
    idproduto: number;
    nome: string;
  };
};

interface Venda {
  idvenda: number;
  cliente_idCliente: number;
  cliente: { nome: string };
}

interface Produto {
  idproduto: number;
  nome: string;
  preco_venda: number;
}

interface ProdutoVendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ProdutoVenda | null;
  vendas: Venda[];
  produtos: Produto[];
}

export function ProdutoVendaDialog({ isOpen, onClose, item, vendas, produtos }: ProdutoVendaDialogProps) {
  const [form, setForm] = useState({
    quantidade: "1",
    preco: "0",
    total: "0",
    venda_idvenda: "",
    produto_idproduto: "",
  });
  const [loading, setLoading] = useState(false);
  const [showVendaSelect, setShowVendaSelect] = useState(false);
  const [showProdutoSelect, setShowProdutoSelect] = useState(false);
  const [searchVenda, setSearchVenda] = useState("");
  const [searchProduto, setSearchProduto] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({
        quantidade: item?.quantidade?.toString() || "1",
        preco: item?.preco?.toString() || "0",
        total: item?.total?.toString() || "0",
        venda_idvenda: item?.venda_idvenda?.toString() || "",
        produto_idproduto: item?.produto_idproduto?.toString() || "",
      });
      setSearchVenda("");
      setSearchProduto("");
    }
  }, [isOpen, item]);

  // Atualiza total quando quantidade ou preço muda
  useEffect(() => {
    const q = parseFloat(form.quantidade) || 0;
    const p = parseFloat(form.preco) || 0;
    setForm(prev => ({ ...prev, total: (q * p).toFixed(2) }));
  }, [form.quantidade, form.preco]);

  if (!isOpen) return null;

  const filteredVendas = vendas.filter((v) =>
    v.idvenda.toString().includes(searchVenda) || 
    v.cliente.nome.toLowerCase().includes(searchVenda.toLowerCase())
  );

  const filteredProdutos = produtos.filter((p) =>
    p.nome.toLowerCase().includes(searchProduto.toLowerCase())
  );

  const selectedVenda = vendas.find((v) => v.idvenda.toString() === form.venda_idvenda);
  const selectedProduto = produtos.find((p) => p.idproduto.toString() === form.produto_idproduto);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.venda_idvenda || !form.produto_idproduto) {
      alert("Por favor, selecione a venda e o produto.");
      return;
    }
    setLoading(true);
    const vendaObj = vendas.find(v => v.idvenda.toString() === form.venda_idvenda);
    await saveProdutoVenda({
      idproduto_venda: item?.idproduto_venda,
      quantidade: parseInt(form.quantidade),
      preco: parseFloat(form.preco),
      total: parseFloat(form.total),
      venda_idvenda: parseInt(form.venda_idvenda),
      venda_cliente_idCliente: vendaObj!.cliente_idCliente,
      produto_idproduto: parseInt(form.produto_idproduto),
    });
    setLoading(false);
    onClose();
  }

  const inputClass = "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">{item ? "Alterar Item" : "Adicionar Item à Venda"}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selecionar Venda */}
          <div className="relative">
            <label className={labelClass}>Venda *</label>
            <button type="button" onClick={() => setShowVendaSelect(!showVendaSelect)} className={`${inputClass} flex justify-between`}>
              <span className={selectedVenda ? "" : "text-muted-foreground"}>
                {selectedVenda ? `Venda #${selectedVenda.idvenda} - ${selectedVenda.cliente.nome}` : "Selecione a venda..."}
              </span>
              <ChevronDown size={16} className="opacity-50" />
            </button>
            {showVendaSelect && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md p-1">
                <input className="w-full bg-transparent px-2 py-1.5 text-sm outline-none" placeholder="Buscar venda ou cliente..." value={searchVenda} onChange={(e) => setSearchVenda(e.target.value)} autoFocus />
                <div className="max-h-40 overflow-y-auto">
                  {filteredVendas.map(v => (
                    <button key={v.idvenda} type="button" onClick={() => { setForm(f => ({ ...f, venda_idvenda: v.idvenda.toString() })); setShowVendaSelect(false); }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                      Venda #{v.idvenda} - {v.cliente.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selecionar Produto */}
          <div className="relative">
            <label className={labelClass}>Produto *</label>
            <button type="button" onClick={() => setShowProdutoSelect(!showProdutoSelect)} className={`${inputClass} flex justify-between`}>
              <span className={selectedProduto ? "" : "text-muted-foreground"}>
                {selectedProduto ? selectedProduto.nome : "Selecione o produto..."}
              </span>
              <ChevronDown size={16} className="opacity-50" />
            </button>
            {showProdutoSelect && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md p-1">
                <input className="w-full bg-transparent px-2 py-1.5 text-sm outline-none" placeholder="Buscar produto..." value={searchProduto} onChange={(e) => setSearchProduto(e.target.value)} autoFocus />
                <div className="max-h-40 overflow-y-auto">
                  {filteredProdutos.map(p => (
                    <button key={p.idproduto} type="button" onClick={() => { 
                      setForm(f => ({ ...f, produto_idproduto: p.idproduto.toString(), preco: p.preco_venda.toString() })); 
                      setShowProdutoSelect(false); 
                    }} className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                      {p.nome} - R$ {p.preco_venda.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantidade *</label>
              <input type="number" required min="1" max="100" value={form.quantidade} onChange={(e) => setForm(f => ({ ...f, quantidade: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Preço Unitário *</label>
              <input type="number" required step="0.01" value={form.preco} onChange={(e) => setForm(f => ({ ...f, preco: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Total do Item</label>
            <div className={`${inputClass} bg-slate-100 dark:bg-slate-800 font-bold text-lg`}>
              R$ {parseFloat(form.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-accent">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-900/90 disabled:opacity-50">
              {loading ? "Salvando..." : "Salvar Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
