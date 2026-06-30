import { Link } from "react-router-dom";

import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t font-geist">
      <div className="max-w-6xl border-x mx-auto py-6 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="md:flex hidden items-center gap-6 text-sm text-muted-foreground">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StillUp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
