export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-zinc-50 p-4 mt-4 shadow-sm">
      <p className="text-center">© {year} Cadê</p>
    </footer>
  );
}
