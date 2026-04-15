import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    skipped: true,
    reason: "Email reminders are disabled in this version.",
  });
}
