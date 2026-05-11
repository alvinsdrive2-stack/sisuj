import { NextResponse } from "next/server";
import { getAdminTUKById } from "@/lib/admin-tuk";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getAdminTUKById(Number(params.id));
    if (!data) return NextResponse.json({ error: "Admin TUK tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
