import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pesananSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tanggal = searchParams.get("tanggal");
  const kurirId = searchParams.get("kurirId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (kurirId) where.kurirId = kurirId;
  if (tanggal) {
    const start = new Date(`${tanggal}T00:00:00`);
    const end = new Date(`${tanggal}T23:59:59.999`);
    where.tanggal = { gte: start, lte: end };
  }

  const pesanan = await prisma.pesanan.findMany({
    where,
    include: { pelanggan: true, items: { include: { produk: true } }, kurir: true },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(pesanan);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pesananSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const { pelangganId, tanggal, items } = parsed.data;

  const pelanggan = await prisma.pelanggan.findUnique({ where: { id: pelangganId } });
  if (!pelanggan) {
    return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 400 });
  }

  const produkIds = [...new Set(items.map((i) => i.produkId))];
  const produkList = await prisma.produk.findMany({ where: { id: { in: produkIds } } });
  if (produkList.length !== produkIds.length) {
    return NextResponse.json({ error: "Salah satu produk tidak ditemukan" }, { status: 400 });
  }
  const produkMap = new Map(produkList.map((p) => [p.id, p]));

  const pesanan = await prisma.pesanan.create({
    data: {
      pelangganId,
      tanggal: new Date(tanggal),
      status: "BARU",
      items: {
        create: items.map((item) => ({
          produkId: item.produkId,
          jumlah: item.jumlah,
          hargaSatuan: produkMap.get(item.produkId)!.harga,
        })),
      },
    },
    include: { items: { include: { produk: true } }, pelanggan: true },
  });

  return NextResponse.json(pesanan, { status: 201 });
}
