export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-screen flex flex-col justify-center items-center bg-zinc-100 antialiased overflow-y-hidden">
      <main className=" flex-1  mx-auto container px-2 sm:px-2 lg:px-8 overflow-y-hidden">
        {children}
      </main>
    </div>
  );
}
