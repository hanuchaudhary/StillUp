import type React from "react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { DecorIcon } from "@/components/ui/decor-icon";

type AuthFrameProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthFrame({ title, subtitle, children, footer }: AuthFrameProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 md:px-8">
      <div
        className={cn(
          "relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8",
          "dark:bg-[radial-gradient(50%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]"
        )}
      >
        <div className="absolute -inset-y-6 -left-px w-px bg-border" />
        <div className="absolute -inset-y-6 -right-px w-px bg-border" />
        <div className="absolute -inset-x-6 -top-px h-px bg-border" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-border" />
        <DecorIcon position="top-left" />
        <DecorIcon position="bottom-right" />

        <div className="w-full animate-in space-y-8">
          <div className="space-y-3">
            <Logo />
            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl font-bold tracking-wide">{title}</h1>
              <p className="text-base text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {children}
          {footer ? <div className="text-muted-foreground text-sm">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}