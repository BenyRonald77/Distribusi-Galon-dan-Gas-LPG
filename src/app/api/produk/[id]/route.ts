import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { produkSchema } from "@/lib/validation";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const produk = await prisma.produk.findUnique({ where: { id: params.id } });
  if (!produk) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(produk);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = produkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const { varian, depositGalon, ...rest } = parsed.data;
  const produk = await prisma.produk.update({
    where: { id: params.id },
    data: {
      ...rest,
      varian: varian || null,
      depositGalon: rest.jenis === "GALON" ? depositGalon ?? null : null,
    },
  });
  return NextResponse.json(produk);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.produk.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Produk tidak bisa dihapus karena masih dipakai pada riwayat pesanan." },
      { status: 409 }
    );
  }
}
