import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";

interface HeaderProps {
  children?: React.ReactNode;
  name: string;
  links: {
    name: string;
    url: string;
  }[];
}

export default function Header({ name, links }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const userPrefersDark = localStorage.getItem("theme") === "dark";
    setDarkMode(userPrefersDark);

    if (userPrefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newDarkMode = !prev;
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newDarkMode;
    });
  };

  return (
    <header className="flex justify-between items-center p-4 shadow-xs bg-zinc-50 mb-4">
      <h1 className="text-lg font-bold">{name}</h1>
      <nav>
        <ul className="space-x-4 hidden md:flex">
          {links.map((link, index) => (
            <li key={index}>
              <Button asChild variant={"link"}>
                <a href={link.url}>{link.name}</a>
              </Button>
            </li>
          ))}
        </ul>
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger>
              <Menu />
            </DrawerTrigger>
            <DrawerContent>
              <ul className="space-y-4 p-4">
                {links.map((link, index) => (
                  <li key={index}>
                    <Button asChild variant={"link"}>
                      <a href={link.url}>{link.name}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
      <Button onClick={toggleDarkMode} className="ml-4 p-2">
        {darkMode ? <Sun /> : <Moon />}
      </Button>
    </header>
  );
}
