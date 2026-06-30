import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Menu, X } from "lucide-react";

import { useSession } from "@/lib/auth.client";
import { cn } from "@/lib/utils";

import { UserDropdown } from "../auth/UserDropdown";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import { FullWidthDivider } from "../ui/full-width-divider";

export default function Navbar() {
  const pathname = useLocation().pathname;
  const { data } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Billing", url: "/billing" },
    { title: "Settings", url: "/settings" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur overflow-x-clip">
      <FullWidthDivider position="bottom" />
      <div className="flex items-center justify-between pr-2 sm:pr-4">
        <div className="flex items-center h-16 min-w-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 h-full pl-4 pr-3 sm:pr-10 dark:bg-red-950/50 w-full border-r bg-red-50/50 transition-colors hover:bg-red-100/50"
          >
            <Logo />
          </Link>
          <nav className="hidden sm:flex items-center border-r divide-x divide-border h-full">
            {navItems.map((item) => {
              const isActive =
                item.url === "/dashboard"
                  ? pathname === "/dashboard" ||
                    pathname.startsWith("/monitors")
                  : pathname.startsWith(item.url);

              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={cn(
                    "flex items-center gap-2 px-2 sm:px-5 h-full text-sm transition-colors",
                    isActive
                      ? "dark:bg-accent/50 dark:text-foreground dark:no-underline underline"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <span className="hidden sm:inline font-semibold uppercase text-xs">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <UserDropdown
            email={data?.user?.email}
            name={data?.user?.name}
            image={data?.user?.image}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="sm:hidden border-t bg-background/95 backdrop-blur px-2 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.url === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/monitors")
                : pathname.startsWith(item.url);

            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "block px-3 py-2 text-sm font-semibold uppercase transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
