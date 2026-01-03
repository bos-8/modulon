"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function AuthButton() {
  return (
    <Button
      theme="main"
      className="rounded border border-border px-3 py-1.5 text-sm"
      onClick={() => void signIn("keycloak")}
    >
      Sign in
    </Button>
  );
}
