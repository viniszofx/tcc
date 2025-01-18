import { Menu } from "lucide-react";
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

export default function header({ name, links }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 shadow-sm bg-zinc-50 mb-4">
      <h1>{name}</h1>
      <nav>
        <ul className=" space-x-4 hidden md:flex ">
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
                    <li />
                  </li>
                ))}
              </ul>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </header>
  );
}
