import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

// GET /api/offers — list active offers
export async function GET(req: NextRequest) {
  const db = getServiceSupabase();
  const searchParams = req.nextUrl.searchParams;

  const type = searchParams.get("type"); // 'buy' or 'sell'
  const methods = searchParams.get("methods"); // comma-separated
  const sort = searchParams.get("sort") || "lowest_fee";

  let query = db
    .from("offers")
    .select("*, user:users(*)")
    .eq("is_active", true);

  if (type) {
    query = query.eq("type", type);
  }

  if (methods) {
    const methodList = methods.split(",");
    query = query.overlaps("payment_methods", methodList);
  }

  switch (sort) {
    case "lowest_fee":
      query = query.order("premium_discount", { ascending: true });
      break;
    case "highest_fee":
      query = query.order("premium_discount", { ascending: false });
      break;
    case "low_min":
      query = query.order("min_zec", { ascending: true, nullsFirst: false });
      break;
    case "high_min":
      query = query.order("min_zec", { ascending: false, nullsFirst: true });
      break;
    case "low_max":
      query = query.order("max_zec", { ascending: true, nullsFirst: false });
      break;
    case "high_max":
      query = query.order("max_zec", { ascending: false, nullsFirst: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/offers — create an offer
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceSupabase();
  const body = await req.json();

  // Look up user by ns_sub
  const { data: user } = await db
    .from("users")
    .select("id")
    .eq("ns_sub", session.user.id)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await db
    .from("offers")
    .insert({
      user_id: user.id,
      type: body.type,
      premium_discount: body.premium_discount,
      min_zec: body.min_zec || null,
      max_zec: body.max_zec || null,
      payment_methods: body.payment_methods,
    })
    .select("*, user:users(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
