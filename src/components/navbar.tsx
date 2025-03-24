import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { Terminal, UserCircle } from "lucide-react";
import UserProfile from "./user-profile";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-cyan-900/30 bg-gray-900 py-3 font-mono">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          prefetch
          className="text-xl font-bold flex items-center text-cyan-400"
        >
          <Terminal className="mr-2 h-6 w-6" />
          <span>Rovyk</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
              >
                <Button
                  variant="outline"
                  className="border-cyan-500 text-cyan-400 hover:text-gray-900 hover:bg-cyan-400"
                >
                  $ terminal
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
              >
                $ login
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-cyan-400 rounded-md hover:bg-cyan-300 border border-cyan-500"
              >
                $ register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
