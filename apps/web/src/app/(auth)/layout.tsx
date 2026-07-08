export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <span className="text-lg font-semibold text-primary">Ademicon</span>
          <span className="text-sm text-muted-foreground">Plataforma de prospecção comercial</span>
        </div>
        {children}
      </div>
    </div>
  );
}
