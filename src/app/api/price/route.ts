import { NextResponse } from "next/server";
import { getZecPrice } from "@/lib/price";

export async function GET() {
  try {
    const price = await getZecPrice();
    return NextResponse.json(price);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
