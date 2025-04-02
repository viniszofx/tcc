"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
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
        <Button onClick={toggleDarkMode} className="md:p-4 p-3 bg-[var(--button-color)] cursor-pointer">
            {darkMode ? <Sun /> : <Moon />}
        </Button>
    );
}