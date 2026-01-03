import { auth } from "@/auth";
import { SignInButton } from "@/components/ui/SignInButton";
import { SignOutButton } from "@/components/ui/SignOutButton";

export async function NavbarAuthSlot() {
  const session = await auth();

  if (!session?.user) {
    return <SignInButton className="rounded border border-border px-3 py-1.5 text-sm" />;
  }

  return <SignOutButton className="rounded border border-border px-3 py-1.5 text-sm" />;
}
