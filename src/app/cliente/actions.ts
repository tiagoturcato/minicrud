"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClientes() {
  return await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: { cidade: true },
  });
}

export async function getCidades() {
  return await prisma.cidade.findMany({ orderBy: { nome: "asc" } });
}

export async function saveCliente(data: {
  idCliente?: number;
  nome: string;
  cpf: string;
  endereco: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade_idcidade: number;
  dtnasc?: string;
  salario?: number | null;
  ativo: number;
}) {
  const payload = {
    nome: data.nome,
    cpf: data.cpf,
    endereco: data.endereco,
    numero: data.numero,
    complemento: data.complemento || null,
    bairro: data.bairro,
    cidade_idcidade: data.cidade_idcidade,
    dtnasc: data.dtnasc || null,
    salario: data.salario ?? null,
    ativo: data.ativo,
  };

  if (data.idCliente) {
    await prisma.cliente.update({
      where: { idCliente: data.idCliente },
      data: payload,
    });
  } else {
    await prisma.cliente.create({ data: payload });
  }
  revalidatePath("/cliente");
}

export async function deleteCliente(idCliente: number) {
  await prisma.cliente.delete({ where: { idCliente } });
  revalidatePath("/cliente");
}
