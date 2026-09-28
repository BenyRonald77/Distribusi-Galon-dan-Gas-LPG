import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pelangganSchema } from "@/lib/validation";

export async function GET() {
  const data = await prisma.pelanggan.findMany({
    orderBy: { nama: "asc" },
    include: { galonPinjaman: true },
  });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pelangganSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const pelanggan = await prisma.pelanggan.create({ data: parsed.data });
  return NextResponse.json(pelanggan, { status: 201 });
}
