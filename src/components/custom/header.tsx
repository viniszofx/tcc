import { ReactNode } from "react";

export default function Header({ children }: { children: ReactNode }) {
  return <header className="p-8 bg-zinc-50 shadow-sm">{children}</header>;
}
