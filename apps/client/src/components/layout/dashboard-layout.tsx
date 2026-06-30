import { type ReactNode } from "react";

import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth.client";

import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isPending } = useSession();
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-fustat tracking-wide max-w-4xl mx-auto sm:border-x">
      <Navbar />
      <main className="">{children}</main>
    </div>
  );
}
