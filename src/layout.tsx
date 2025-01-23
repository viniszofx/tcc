import React from "react";
import Header from "./components/custom/header";
import { Footer } from "./components/custom/footer";

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

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-zinc-100 antialiased min-h-screen overflow-y-hidden">
      <Header name=" Cadê" links={links}></Header>
      <main className=" flex-1  flex justify-center items-center px-2 sm:px-2 lg:px-8 overflow-y-hidden">
        {children}
      </main>
      <Footer></Footer>
    </div>
  );
}
