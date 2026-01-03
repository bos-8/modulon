"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignInButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      theme="main"
      className={className}
      disabled={busy}
      onClick={() => {
        if (busy) return;
        setBusy(true);
        void signIn("keycloak", { callbackUrl: "/" });
      }}
    >
      {busy ? "Redirecting..." : "Sign in"}
    </Button>
  );
}
