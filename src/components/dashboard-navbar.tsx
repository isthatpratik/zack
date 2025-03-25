"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import ModelSelector from "./model-selector";

type AIModel = "openai" | "claude" | "gemini" | "grok" | "deepseek";

interface DashboardNavbarProps {
  onModelChange?: (model: AIModel) => void;
}

export default function DashboardNavbar({
  onModelChange,
}: DashboardNavbarProps) {
  const supabase = createClient();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<AIModel>("openai");

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
  };

  return (
    <nav className="w-full border-b border-cyan-900/30 bg-gray-900 py-4 font-mono">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/"
            prefetch
            className="text-xl font-bold flex items-center text-cyan-400"
          >
            <Terminal className="mr-2 h-6 w-6" />
            <span>Rovyk</span>
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          <Link
            href="/pricing"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Pricing
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-gray-800"
              >
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-cyan-900/30"
            >
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="text-gray-200 hover:bg-gray-700 hover:text-cyan-300"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
