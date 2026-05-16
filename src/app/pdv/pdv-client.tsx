"use client";

import { useState, useRef, useCallback } from "react";
import {
  buscarClientes,
  buscarProdutos,
  finalizarVenda,
  type ItemCarrinho,
} from "./actions";
import {
  Search,
  UserCheck,
  Package,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  RefreshCw,
  Monitor,
} from "lucide-react";

type Cliente = {
  idCliente: number;
  nome: string;
  cpf: string;
  cidade: { nome: string; estado: string };
};

type Produto = {
  idproduto: number;
  nome: string;
  sku: string;
  preco_venda: number;
};

type EstadoPDV = "vendendo" | "finalizado" | "erro";

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PDVClient() {
  // --- Estado ---
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [resultadosCliente, setResultadosCliente] = useState<Cliente[]>([]);
  const [loadingCliente, setLoadingCliente] = useState(false);

  const [buscaProduto, setBuscaProduto] = useState("");
  const [resultadosProduto, setResultadosProduto] = useState<Produto[]>([]);
  const [loadingProduto, setLoadingProduto] = useState(false);

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [tipo, setTipo] = useState("PV");
  const [formapagto, setFormapagto] = useState("Dinheiro");

  const [estado, setEstado] = useState<EstadoPDV>("vendendo");
  const [vendaFinalizada, setVendaFinalizada] = useState<number | null>(null);
  const [erroMsg, setErroMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const inputProdutoRef = useRef<HTMLInputElement>(null);

  // --- Cálculos ---
  const subtotal = carrinho.reduce((s, i) => s + i.total, 0);
  const totalFinal = Math.max(0, subtotal - desconto);

  // --- Busca Cliente ---
  const handleBuscaCliente = useCallback(async (termo: string) => {
    setBuscaCliente(termo);
    if (termo.length < 2) { setResultadosCliente([]); return; }
    setLoadingCliente(true);
    const res = await buscarClientes(termo);
    setResultadosCliente(res as Cliente[]);
    setLoadingCliente(false);
  }, []);

  function selecionarCliente(c: Cliente) {
    setCliente(c);
    setBuscaCliente("");
    setResultadosCliente([]);
    inputProdutoRef.current?.focus();
  }

  // --- Busca Produto ---
  const handleBuscaProduto = useCallback(async (termo: string) => {
    setBuscaProduto(termo);
    if (termo.length < 1) { setResultadosProduto([]); return; }
    setLoadingProduto(true);
    const res = await buscarProdutos(termo);
    setResultadosProduto(res as Produto[]);
    setLoadingProduto(false);
  }, []);

  function adicionarProduto(p: Produto) {
    setCarrinho((prev) => {
      const existente = prev.find((i) => i.produto_idproduto === p.idproduto);
      if (existente) {
        return prev.map((i) =>
          i.produto_idproduto === p.idproduto
            ? { ...i, quantidade: i.quantidade + 1, total: (i.quantidade + 1) * i.preco }
            : i
        );
      }
      return [
        ...prev,
        {
          produto_idproduto: p.idproduto,
          nome: p.nome,
          sku: p.sku,
          quantidade: 1,
          preco: p.preco_venda,
          total: p.preco_venda,
        },
      ];
    });
    setBuscaProduto("");
    setResultadosProduto([]);
    inputProdutoRef.current?.focus();
  }

  function alterarQtd(id: number, delta: number) {
    setCarrinho((prev) =>
      prev
        .map((i) =>
          i.produto_idproduto === id
            ? { ...i, quantidade: i.quantidade + delta, total: (i.quantidade + delta) * i.preco }
            : i
        )
        .filter((i) => i.quantidade > 0)
    );
  }

  function removerItem(id: number) {
    setCarrinho((prev) => prev.filter((i) => i.produto_idproduto !== id));
  }

  // --- Finalizar ---
  async function handleFinalizar() {
    if (!cliente) { setErroMsg("Selecione um cliente antes de finalizar."); setEstado("erro"); return; }
    if (carrinho.length === 0) return;

    setLoading(true);
    setErroMsg("");
    const res = await finalizarVenda({
      cliente_idCliente: cliente.idCliente,
      tipo,
      formapagto,
      desconto,
      total: totalFinal,
      itens: carrinho,
    });
    setLoading(false);

    if (res.success) {
      setVendaFinalizada(res.idvenda!);
      setEstado("finalizado");
    } else {
      setErroMsg(res.error || "Erro desconhecido.");
      setEstado("erro");
    }
  }

  function novaVenda() {
    setCliente(null);
    setCarrinho([]);
    setDesconto(0);
    setTipo("PV");
    setFormapagto("Dinheiro");
    setEstado("vendendo");
    setVendaFinalizada(null);
    setErroMsg("");
  }

  // ===== TELA FINALIZADO =====
  if (estado === "finalizado") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-6 max-w-md">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
          <div>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">Venda Finalizada!</h2>
            <p className="text-muted-foreground mt-2">Venda <span className="font-bold">#{vendaFinalizada}</span> registrada com sucesso.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-2">
            <p><span className="text-muted-foreground">Cliente:</span> <strong>{cliente?.nome}</strong></p>
            <p><span className="text-muted-foreground">Itens:</span> <strong>{carrinho.length}</strong></p>
            <p><span className="text-muted-foreground">Subtotal:</span> <strong>{formatCurrency(subtotal)}</strong></p>
            {desconto > 0 && <p><span className="text-muted-foreground">Desconto:</span> <strong className="text-red-500">-{formatCurrency(desconto)}</strong></p>}
            <p className="text-xl"><span className="text-muted-foreground">Total:</span> <strong className="text-green-600 dark:text-green-400">{formatCurrency(totalFinal)}</strong></p>
            <p><span className="text-muted-foreground">Pagamento:</span> <strong>{formapagto}</strong></p>
          </div>
          <button onClick={novaVenda} className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
            <RefreshCw size={16} /> Nova Venda
          </button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block";

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3 bg-slate-900 dark:bg-slate-950">
        <Monitor className="text-green-400" size={22} />
        <h1 className="text-lg font-bold text-white">PDV – Ponto de Venda</h1>
        <span className="ml-auto text-xs text-slate-400">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* ===== COLUNA ESQUERDA: CLIENTE ===== */}
        <div className="w-72 shrink-0 border-r border-border bg-slate-50 dark:bg-slate-900 flex flex-col p-4 gap-4">
          <div>
            <label className={labelCls}>Cliente</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nome ou código..."
                value={buscaCliente}
                onChange={(e) => handleBuscaCliente(e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
            {resultadosCliente.length > 0 && (
              <div className="mt-1 rounded-lg border border-border bg-popover shadow-lg z-50">
                {resultadosCliente.map((c) => (
                  <button key={c.idCliente} onClick={() => selecionarCliente(c)} className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex flex-col">
                    <span className="font-medium">{c.nome}</span>
                    <span className="text-xs text-muted-foreground">#{c.idCliente} · {c.cpf}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {cliente ? (
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">Cliente Selecionado</span>
              </div>
              <p className="font-bold text-sm">{cliente.nome}</p>
              <p className="text-xs text-muted-foreground">{cliente.cpf}</p>
              <p className="text-xs text-muted-foreground">{cliente.cidade.nome}/{cliente.cidade.estado}</p>
              <button onClick={() => setCliente(null)} className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <X size={12} /> Remover
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Nenhum cliente selecionado.<br />Busque acima para selecionar.
            </div>
          )}

          {/* Configurações da venda */}
          <div className="space-y-3 mt-auto">
            <div>
              <label className={labelCls}>Tipo de Documento</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
                <option value="PV">Pedido de Venda</option>
                <option value="NF">Nota Fiscal</option>
                <option value="OR">Orçamento</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Forma de Pagamento</label>
              <select value={formapagto} onChange={(e) => setFormapagto(e.target.value)} className={inputCls}>
                <option>Dinheiro</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
                <option>PIX</option>
                <option>Boleto</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== COLUNA CENTRAL: ITENS ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Busca produto */}
          <div className="p-4 border-b border-border bg-white dark:bg-slate-950">
            <label className={labelCls}>Adicionar Produto (nome, SKU ou código)</label>
            <div className="relative">
              <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputProdutoRef}
                type="text"
                placeholder="Digite e selecione o produto..."
                value={buscaProduto}
                onChange={(e) => handleBuscaProduto(e.target.value)}
                className={`${inputCls} pl-8`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && resultadosProduto.length > 0) {
                    adicionarProduto(resultadosProduto[0]);
                  }
                }}
              />
            </div>
            {resultadosProduto.length > 0 && (
              <div className="mt-1 rounded-lg border border-border bg-popover shadow-lg">
                {resultadosProduto.map((p) => (
                  <button key={p.idproduto} onClick={() => adicionarProduto(p)} className="w-full text-left px-3 py-2.5 hover:bg-accent text-sm flex items-center justify-between gap-4">
                    <div>
                      <span className="font-medium">{p.nome}</span>
                      <span className="ml-2 text-xs text-muted-foreground font-mono">{p.sku}</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400 shrink-0">{formatCurrency(p.preco_venda)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabela de itens */}
          <div className="flex-1 overflow-y-auto">
            {carrinho.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <ShoppingCart size={40} className="opacity-20" />
                <p className="text-sm">Nenhum item adicionado ainda.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground w-32">Qtd</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Subtotal</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {carrinho.map((item) => (
                    <tr key={item.produto_idproduto} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => alterarQtd(item.produto_idproduto, -1)} className="rounded-md p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantidade}</span>
                          <button onClick={() => alterarQtd(item.produto_idproduto, 1)} className="rounded-md p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(item.preco)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removerItem(item.produto_idproduto)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ===== COLUNA DIREITA: TOTAIS + FINALIZAR ===== */}
        <div className="w-72 shrink-0 border-l border-border bg-slate-50 dark:bg-slate-900 flex flex-col p-5 gap-4">
          <h2 className="font-bold text-base">Resumo da Venda</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Itens</span>
              <span className="font-medium">{carrinho.reduce((s, i) => s + i.quantidade, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground shrink-0">Desconto (R$)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={desconto || ""}
                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-bold text-base">TOTAL</span>
              <span className="font-black text-2xl text-green-600 dark:text-green-400">{formatCurrency(totalFinal)}</span>
            </div>
          </div>

          {/* Aviso desconto 100% */}
          {carrinho.length > 0 && totalFinal <= 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex gap-2 items-start">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Desconto inválido!</strong> O total não pode ser R$ 0,00. Reduza o desconto.
              </p>
            </div>
          )}

          {/* Erro */}
          {estado === "erro" && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 flex gap-2 items-start">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-400">Erro</p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{erroMsg}</p>
              </div>
              <button onClick={() => setEstado("vendendo")} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
            </div>
          )}

          <div className="mt-auto space-y-2">
            {!cliente && (
              <div className="text-xs text-amber-600 dark:text-amber-400 text-center bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 border border-amber-200 dark:border-amber-800">
                ⚠️ Selecione um cliente para continuar
              </div>
            )}
            <button
              onClick={handleFinalizar}
              disabled={loading || carrinho.length === 0 || !cliente || totalFinal <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 text-base transition-colors"
            >
              {loading ? (
                <span className="animate-pulse">Processando...</span>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Finalizar Venda
                </>
              )}
            </button>
            <button onClick={novaVenda} className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1">
              Limpar / Nova Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
