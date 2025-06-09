import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
        <div className='flex flex-col items-center justify-center h-screen p-4 bg-[var(--card-color)]'>
            <main className="w-full">
                {children}
            </main>
        </div>
        </ThemeProvider>
    )
}