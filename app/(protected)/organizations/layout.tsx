export const metadata = {
  title: "Página Inicial - KDÊ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressContentEditableWarning suppressHydrationWarning>
      <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      <body
        suppressHydrationWarning
        suppressContentEditableWarning
        className={
          "min-h-screen flex flex-col justify-center items-center bg-[var(--bg-secondary)] text-[var(--font-color)]"
        }
      >
        {children}
      </body>
    </html>
  );
}
