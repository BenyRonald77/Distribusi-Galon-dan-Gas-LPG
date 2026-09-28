import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { selesaikanPesananSchema } from "@/lib/validation";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const pesanan = await prisma.pesanan.findUnique({
    where: { id: params.id },
    include: { pelanggan: true, kurir: true, items: { include: { produk: true } } },
  });
  if (!pesanan) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(pesanan);
}

const NEXT_STATUS: Record<string, string> = {
  DIPROSES: "DIANTAR",
  DIANTAR: "SELESAI",
};

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = selesaikanPesananSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const { status, galonKosongDiambil, depositDiterima } = parsed.data;

  const pesanan = await prisma.pesanan.findUnique({
    where: { id: params.id },
    include: { items: { include: { produk: true } } },
  });
  if (!pesanan) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const expectedCurrentStatus = Object.keys(NEXT_STATUS).find((from) => NEXT_STATUS[from] === status);
  if (!expectedCurrentStatus || pesanan.status !== expectedCurrentStatus) {
    return NextResponse.json(
      { error: `Pesanan berstatus ${pesanan.status} tidak bisa langsung diubah menjadi ${status}` },
      { status: 409 }
    );
  }

  const jumlahGalonItem = pesanan.items
    .filter((item) => item.produk.jenis === "GALON")
    .reduce((sum, item) => sum + item.jumlah, 0);

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.pesanan.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "SELESAI"
          ? {
              galonKosongDiambil: jumlahGalonItem > 0 ? galonKosongDiambil ?? 0 : null,
              depositDiterima: jumlahGalonItem > 0 ? depositDiterima ?? 0 : null,
            }
          : {}),
      },
    });

    if (status === "SELESAI" && jumlahGalonItem > 0) {
      const kosongDiambil = galonKosongDiambil ?? 0;
      const deposit = depositDiterima ?? 0;
      await tx.galonPinjaman.upsert({
        where: { pelangganId: pesanan.pelangganId },
        create: {
          pelangganId: pesanan.pelangganId,
          jumlahDipinjam: jumlahGalonItem - kosongDiambil,
          depositTerkumpul: deposit,
        },
        update: {
          jumlahDipinjam: { increment: jumlahGalonItem - kosongDiambil },
          depositTerkumpul: { increment: deposit },
        },
      });
    }

    return updated;
  });

  return NextResponse.json(result);
}
