import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { produkSchema } from "@/lib/validation";

export async function GET() {
  const data = await prisma.produk.findMany({ orderBy: [{ jenis: "asc" }, { nama: "asc" }] });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = produkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const { varian, depositGalon, ...rest } = parsed.data;
  const produk = await prisma.produk.create({
    data: {
      ...rest,
      varian: varian || null,
      depositGalon: rest.jenis === "GALON" ? depositGalon ?? null : null,
    },
  });
  return NextResponse.json(produk, { status: 201 });
}
