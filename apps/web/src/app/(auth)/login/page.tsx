import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <LoginForm />
      </Suspense>
      <Link
        href="/esqueci-senha"
        className="text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Esqueci minha senha
      </Link>
    </div>
  );
}
