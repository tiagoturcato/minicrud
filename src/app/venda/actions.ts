"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVendas() {
  return await prisma.venda.findMany({
    include: {
      cliente: true,
    },
    orderBy: { data_venda: "desc" },
  });
}

export async function getClientes() {
  return await prisma.cliente.findMany({
    where: { ativo: 1 },
    orderBy: { nome: "asc" },
  });
}

export async function saveVenda(data: {
  idvenda?: number;
  data_venda: string;
  cliente_idCliente: number;
  tipo: string;
  formapagto: string;
  desconto: number;
  total: number;
}) {
  const payload = {
    data_venda: data.data_venda,
    cliente_idCliente: data.cliente_idCliente,
    tipo: data.tipo,
    formapagto: data.formapagto,
    desconto: data.desconto,
    total: data.total,
  };

  if (data.idvenda) {
    await prisma.venda.update({
      where: { idvenda: data.idvenda },
      data: payload,
    });
  } else {
    await prisma.venda.create({ data: payload });
  }
  revalidatePath("/venda");
  revalidatePath("/"); // Update dashboard
}

export async function deleteVenda(idvenda: number) {
  await prisma.venda.delete({ where: { idvenda } });
  revalidatePath("/venda");
  revalidatePath("/");
}
