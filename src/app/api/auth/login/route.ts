import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Username dan password wajib diisi" },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  }

  const token = await createSessionToken(admin.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return response;
}
