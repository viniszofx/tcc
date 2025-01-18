import React from "react";
import Header from "./components/custom/header";

const links = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "About",
    url: "/about",
  },
  {
    name: "Contact",
    url: "/contact",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-100 min-h-screen">
      <Header name="Sistema Cadê" links={links}></Header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
