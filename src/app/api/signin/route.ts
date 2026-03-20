import { signIn } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/";
  return signIn("network-school", { redirectTo: callbackUrl });
}
