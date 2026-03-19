import type { ZecPrice } from "@/types";

let cachedPrice: ZecPrice | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60_000; // 1 minute

export async function getZecPrice(): Promise<ZecPrice> {
  const now = Date.now();
  if (cachedPrice && now - cacheTime < CACHE_DURATION) {
    return cachedPrice;
  }

  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd,eur,sgd,myr",
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    if (cachedPrice) return cachedPrice;
    throw new Error("Failed to fetch ZEC price");
  }

  const data = await res.json();
  cachedPrice = data.zcash as ZecPrice;
  cacheTime = now;
  return cachedPrice;
}
