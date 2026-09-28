import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignRuteSchema } from "@/lib/validation";
import { urutkanRuteNearestNeighbor } from "@/lib/route";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = assignRuteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const { kurirId, pesananIds } = parsed.data;

  const kurir = await prisma.kurir.findUnique({ where: { id: kurirId } });
  if (!kurir) {
    return NextResponse.json({ error: "Kurir tidak ditemukan" }, { status: 400 });
  }

  const pesananList = await prisma.pesanan.findMany({
    where: { id: { in: pesananIds } },
    include: { pelanggan: true },
  });

  if (pesananList.length !== pesananIds.length) {
    return NextResponse.json({ error: "Salah satu pesanan tidak ditemukan" }, { status: 400 });
  }

  const bukanBaru = pesananList.find((p) => p.status !== "BARU");
  if (bukanBaru) {
    return NextResponse.json(
      { error: `Pesanan milik ${bukanBaru.pelanggan.nama} sudah tidak berstatus BARU` },
      { status: 409 }
    );
  }

  const { langkah, totalJarakKm } = urutkanRuteNearestNeighbor(
    pesananList.map((p) => ({ id: p.id, latitude: p.pelanggan.latitude, longitude: p.pelanggan.longitude }))
  );

  await prisma.$transaction(
    langkah.map((step) =>
      prisma.pesanan.update({
        where: { id: step.titik.id },
        data: { kurirId, status: "DIPROSES", urutanRute: step.urutan },
      })
    )
  );

  const pesananById = new Map(pesananList.map((p) => [p.id, p]));
  const hasil = langkah.map((step) => ({
    urutan: step.urutan,
    jarakDariSebelumnyaKm: Number(step.jarakDariSebelumnyaKm.toFixed(2)),
    pesananId: step.titik.id,
    pelanggan: pesananById.get(step.titik.id)!.pelanggan.nama,
    alamat: pesananById.get(step.titik.id)!.pelanggan.alamat,
  }));

  return NextResponse.json({ kurir: kurir.nama, totalJarakKm: Number(totalJarakKm.toFixed(2)), langkah: hasil });
}
