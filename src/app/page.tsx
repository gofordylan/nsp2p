import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getZecPrice } from "@/lib/price";
import { mockPrice } from "@/lib/mock-data";
import { UserMenu } from "./components/user-menu";

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const destination = params.dest;

  const session = await auth();
  if (session?.user && destination) {
    redirect(destination);
  }

  let price = mockPrice;
  try {
    if (!isDevMode) {
      price = await getZecPrice();
    }
  } catch {
    // use mock price as fallback
  }

  const signInUrl = "/api/signin?callbackUrl=/";
  const browseHref = session?.user ? "/offers" : "/api/signin?callbackUrl=/offers";
  const createHref = session?.user ? "/create" : "/api/signin?callbackUrl=/create";

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-[18px] font-bold tracking-[-0.02em] text-[#1A1A1A]">
          NSP2P<span className="text-[#FFA715] text-[36px] leading-[0]">.</span>
        </span>
        {session?.user ? (
          <UserMenu image={session.user.image} name={session.user.name} />
        ) : (
          <a
            href={signInUrl}
            className="flex items-center gap-2 rounded-full bg-[#EEECEA] px-4 py-2 text-[13px] font-medium text-[#1A1A1A] hover:bg-[#E0DDD7] transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Sign in
          </a>
        )}
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col justify-center px-6 -mt-16">
        <h1 className="text-[42px] font-extrabold leading-[46px] tracking-[-0.03em] text-[#1A1A1A]">
          Buy &amp; sell <span className="text-[#FFA715]">ZEC</span> at Network School
        </h1>
        <p className="mt-3 text-[14px] text-[#999999] leading-[22px] text-center w-full">
          Peer-to-peer trades with people you trust.
        </p>

        {/* Steps */}
        <div className="mt-10 flex flex-col">
          <div className="flex items-center gap-[14px] py-[14px] border-t border-[#E8E5E0]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-[12px] font-bold text-white flex-shrink-0">1</span>
            <span className="text-[14px] font-medium text-[#1A1A1A]">Browse current offers or create your own</span>
          </div>
          <div className="flex items-center gap-[14px] py-[14px] border-t border-[#E8E5E0]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-[12px] font-bold text-white flex-shrink-0">2</span>
            <span className="text-[14px] font-medium text-[#1A1A1A]">Contact on Discord to coordinate</span>
          </div>
          <div className="flex items-center gap-[14px] py-[14px] border-t border-b border-[#E8E5E0]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A1A1A] text-[12px] font-bold text-white flex-shrink-0">3</span>
            <span className="text-[14px] font-medium text-[#1A1A1A]">Meet-up and exchange!</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex gap-[10px]">
          <a
            href={browseHref}
            className="flex flex-1 h-[49px] items-center justify-center rounded-[10px] bg-[#1A1A1A] text-[15px] font-semibold text-white hover:bg-[#333333] transition-colors"
          >
            Browse Offers
          </a>
          <a
            href={createHref}
            className="flex flex-1 h-[49px] items-center justify-center rounded-[10px] border-[1.5px] border-[#D0CCC6] text-[15px] font-semibold text-[#1A1A1A] hover:bg-[#EEECEA] transition-colors"
          >
            Create Offer
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 pb-8 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#D4A017] text-[10px] font-bold text-white">Z</span>
          <span className="text-[14px] font-semibold text-[#1A1A1A]">${price.usd.toFixed(2)}</span>
        </div>
        <span className="text-[12px] text-[#999999]">
          Need a wallet?{" "}
          <a href="https://zodl.com/" target="_blank" rel="noopener noreferrer" className="underline decoration-[#E8E5E0] underline-offset-2 hover:text-[#1A1A1A] transition-colors">
            Download Zodl
          </a>.
        </span>
      </footer>
    </div>
  );
}
