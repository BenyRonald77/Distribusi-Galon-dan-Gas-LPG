import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kurirSchema } from "@/lib/validation";

export async function GET() {
  const data = await prisma.kurir.findMany({ orderBy: { nama: "asc" } });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = kurirSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const kurir = await prisma.kurir.create({ data: parsed.data });
  return NextResponse.json(kurir, { status: 201 });
}
