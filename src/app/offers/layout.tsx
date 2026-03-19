import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default async function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDevMode) {
    const session = await auth();
    if (!session?.user) {
      redirect("/?dest=/offers");
    }
  }
  return <>{children}</>;
}
