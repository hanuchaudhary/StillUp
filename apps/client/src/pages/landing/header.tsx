import { Link } from "react-router-dom";

import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b font-geist">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between border-x">
        <Link to="/" className="flex items-center">
          <Logo /> <span className="text-xs text-destructive font-montreal-mono pl-2 uppercase font-bold">
            Paused
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="size-8"
          >
            {theme === "dark" ? (
              <IconSunFilled className="size-4" />
            ) : (
              <IconMoonFilled className="size-4" />
            )}
          </Button>
          <Link to="/login" className="md:block hidden">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">
              Start Free
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
