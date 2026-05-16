"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCidades() {
  return await prisma.cidade.findMany({
    orderBy: { nome: 'asc' }
  });
}

export async function saveCidade(data: { idcidade?: number, nome: string, estado: string }) {
  if (data.idcidade) {
    await prisma.cidade.update({
      where: { idcidade: data.idcidade },
      data: { nome: data.nome, estado: data.estado }
    });
  } else {
    await prisma.cidade.create({
      data: { nome: data.nome, estado: data.estado }
    });
  }
  revalidatePath("/cidade");
}

export async function deleteCidade(idcidade: number) {
  await prisma.cidade.delete({
    where: { idcidade }
  });
  revalidatePath("/cidade");
}
