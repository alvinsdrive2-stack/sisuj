import { NextResponse } from "next/server";
import { getAllAdminTUK } from "@/lib/admin-tuk";

export async function GET() {
  try {
    const result = await getAllAdminTUK({ page: 1, limit: 10 });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
