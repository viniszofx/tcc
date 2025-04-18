import Link from "next/link";
import Image from "next/image";

const dashboardPages = [
  "/",
  "about",
  "inventories",
  "manager/campuses",
  "manager/committees",
  "manager/organizations",
  "manager/users",
];

const dynamicPages = [
  "inventories",
  "manager/campuses",
  "manager/committees",
  "manager/organizations",
  "manager/users",
];

const authPages = ["sign-in", "sign-up", "verify-email"];

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <h2 className="text-xl font-semibold text-center sm:text-left">
          Dashboard Pages
        </h2>
        <ul className="list-disc pl-4">
          {dashboardPages.map((page) => (
            <li key={page}>
              <Link
                className="text-blue-600 hover:underline"
                href={`/dashboard/${page}`}
              >
                /dashboard/{page}
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-center sm:text-left mt-6">
          Dynamic Pages (sample ID: 123)
        </h2>
        <ul className="list-disc pl-4">
          {dynamicPages.map((page) => (
            <li key={page}>
              <Link
                className="text-blue-600 hover:underline"
                href={`/dashboard/${page}/123`}
              >
                /dashboard/{page}/123
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-center sm:text-left mt-6">
          Auth Pages
        </h2>
        <ul className="list-disc pl-4">
          {authPages.map((page) => (
            <li key={page}>
              <Link
                className="text-blue-600 hover:underline"
                href={`/auth/${page} `}
              >
                /auth/{page}
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
