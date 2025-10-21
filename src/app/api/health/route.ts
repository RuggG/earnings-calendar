import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbQuery("select 1");
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Healthcheck failed", error);
    return NextResponse.json(
      { status: "error" },
      { status: 500 }
    );
  }
}
