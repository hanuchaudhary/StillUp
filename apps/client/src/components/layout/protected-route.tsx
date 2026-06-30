import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/lib/auth.client";
import { SessionPageLoader } from "@/components/ui/session-page-loader";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/login");
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return <SessionPageLoader />;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
