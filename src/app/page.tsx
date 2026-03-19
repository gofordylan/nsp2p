import Link from "next/link";
import { mockPrice } from "@/lib/mock-data";

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function Home() {
  const signInHref = isDevMode ? "#" : "/api/auth/signin/network-school";

  return (
    <div className="flex flex-col min-h-dvh px-6">
      {/* Nav */}
      <nav className="flex items-center justify-between py-4">
        <span className="text-lg font-bold tracking-tight">nsp2p</span>
        <Link
          href={signInHref}
          className="rounded-full border border-[#E8E5E0] px-4 py-1.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#EEECEA] transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center -mt-12">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight max-w-[300px]">
          Buy &amp; sell ZEC at Network School.
        </h1>
        <p className="mt-3 text-sm text-[#999999] max-w-[280px] leading-relaxed">
          Peer-to-peer Zcash trading for the NS community. Fast, simple, trust-based.
        </p>

        {/* Steps */}
        <div className="mt-8 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-semibold text-white">
              1
            </span>
            <span className="text-sm text-[#1A1A1A]">Browse</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-semibold text-white">
              2
            </span>
            <span className="text-sm text-[#1A1A1A]">Trade</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-[11px] font-semibold text-white">
              3
            </span>
            <span className="text-sm text-[#1A1A1A]">Settle</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
          <Link
            href="/offers"
            className="flex h-12 items-center justify-center rounded-full bg-[#1A1A1A] text-sm font-medium text-white hover:bg-[#333333] transition-colors"
          >
            Browse Offers
          </Link>
          <Link
            href="/create"
            className="flex h-12 items-center justify-center rounded-full border border-[#E8E5E0] text-sm font-medium text-[#1A1A1A] hover:bg-[#EEECEA] transition-colors"
          >
            Create Offer
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 pb-8 pt-6">
        <p className="text-sm font-medium text-[#1A1A1A]">
          ZEC{" "}
          <span className="text-[#34A853]">
            ${mockPrice.usd.toFixed(2)}
          </span>
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[#999999]">
          <a
            href="https://zecwallet.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[#E8E5E0] underline-offset-2 hover:text-[#1A1A1A] transition-colors"
          >
            Zodl Wallet
          </a>
          <span>·</span>
          <a
            href="https://nsauth.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[#E8E5E0] underline-offset-2 hover:text-[#1A1A1A] transition-colors"
          >
            nsauth.org
          </a>
        </div>
      </footer>
    </div>
  );
}
