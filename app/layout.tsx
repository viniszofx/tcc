import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConsolidatedUserProvider } from "@/hooks/use-consolidated-user";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export const metadata = {
  title: "Página Inicial - KDÊ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      <body className={`${urbanist.variable} font-sans antialiased`}>
        <QueryProvider>
          <SupabaseProvider>
            <ConsolidatedUserProvider>
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </ConsolidatedUserProvider>
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
