"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bot, ChevronDown } from "lucide-react";

type AIModel = "openai" | "claude" | "gemini" | "grok" | "deepseek";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const modelInfo: Record<AIModel, { name: string; color: string }> = {
  openai: { name: "OpenAI", color: "text-green-500" },
  claude: { name: "Claude", color: "text-purple-500" },
  gemini: { name: "Gemini", color: "text-blue-500" },
  grok: { name: "Grok", color: "text-red-500" },
  deepseek: { name: "Deepseek", color: "text-yellow-500" },
};

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-cyan-900/30 bg-gray-800 text-cyan-400 hover:bg-gray-700 hover:text-cyan-300"
        >
          <Bot className={`mr-2 h-4 w-4 ${modelInfo[selectedModel].color}`} />
          {modelInfo[selectedModel].name}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800 border-cyan-900/30">
        {Object.entries(modelInfo).map(([key, { name, color }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onModelChange(key as AIModel)}
            className={`hover:bg-gray-700 ${selectedModel === key ? "bg-gray-700" : ""}`}
          >
            <Bot className={`mr-2 h-4 w-4 ${color}`} />
            <span className="text-gray-200">{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
