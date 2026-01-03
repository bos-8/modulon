"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <Button
      type="button"
      theme="main"
      className={className}
      onClick={async () => {
        await signOut({ redirect: false });

        const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER!;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
        const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!;

        const url = new URL(`${issuer}/protocol/openid-connect/logout`);
        url.searchParams.set("post_logout_redirect_uri", appUrl);
        url.searchParams.set("client_id", clientId);

        window.location.assign(url.toString());
      }}
    >
      Sign out
    </Button>
  );
}
