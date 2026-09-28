import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pelangganSchema } from "@/lib/validation";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const pelanggan = await prisma.pelanggan.findUnique({ where: { id: params.id } });
  if (!pelanggan) {
    return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(pelanggan);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = pelangganSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const pelanggan = await prisma.pelanggan.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(pelanggan);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.pelanggan.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Pelanggan tidak bisa dihapus karena masih memiliki riwayat pesanan atau pinjaman galon." },
      { status: 409 }
    );
  }
}
