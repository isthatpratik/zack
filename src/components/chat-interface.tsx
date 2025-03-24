"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Terminal, Send, Bot, AlertCircle } from "lucide-react";
import { createClient } from "../../supabase/client";

// Define AI model types
type AIModel = "openai" | "claude" | "gemini" | "grok" | "deepseek";

// Define submodels for each AI model
const submodels: Record<AIModel, string[]> = {
  openai: ["GPT-3.5", "GPT-4", "GPT-4o"],
  claude: ["Claude Opus", "Claude Sonnet", "Claude Haiku"],
  gemini: ["Gemini Pro", "Gemini Ultra"],
  grok: ["Grok-1"],
  deepseek: ["Deepseek Coder", "Deepseek Chat"],
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedModel: AIModel;
  onModelChange?: (model: AIModel) => void;
  tokenLimit?: number;
  tokensUsed?: number;
}

export default function ChatInterface({
  selectedModel = "openai",
  onModelChange,
  tokenLimit = 5000,
  tokensUsed = 0,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome to Rovyk Terminal. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedSubmodel, setSelectedSubmodel] = useState<string>(
    submodels[selectedModel][0],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(
    tokenLimit - tokensUsed,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Update submodel when main model changes
  useEffect(() => {
    setSelectedSubmodel(submodels[selectedModel][0]);
  }, [selectedModel]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate token usage (in a real app, this would be calculated based on actual API usage)
  const estimateTokens = (text: string) => {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Estimate tokens for this message
    const estimatedTokens = estimateTokens(input);

    // Check if user has enough tokens
    if (estimatedTokens > remainingTokens) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "You have reached your token limit. Please upgrade to continue using the service.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in a real app, this would call the actual AI API)
    setTimeout(() => {
      // Simulate response based on selected model and submodel
      const responseContent = `This is a simulated response from ${selectedModel} (${selectedSubmodel}). In a production environment, this would connect to the actual AI model API.`;

      const aiMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);

      // Update token usage
      const responseTokens = estimateTokens(responseContent);
      const totalUsed = estimatedTokens + responseTokens;
      setRemainingTokens((prev) => prev - totalUsed);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-900 text-gray-100 font-mono rounded-lg border border-cyan-900/30 overflow-hidden">
      {/* Chat header with token info */}
      <div className="bg-gray-800 p-4 border-b border-cyan-900/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <span className="text-cyan-400">Rovyk Terminal</span>
        </div>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>
            Tokens: {remainingTokens} / {tokenLimit}
          </span>
          {remainingTokens < 500 && (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-[80%] ${message.role === "user" ? "bg-cyan-900/30 border-cyan-800" : message.role === "system" ? "bg-gray-800/50 border-gray-700" : "bg-gray-800 border-gray-700"}`}
            >
              <CardContent className="p-3">
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1 text-xs text-cyan-400">
                    <Bot className="h-3 w-3" />
                    <span>
                      {selectedModel} ({selectedSubmodel})
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area with submodel selection */}
      <div className="p-4 border-t border-cyan-900/30 bg-gray-800">
        <div className="flex gap-2 mb-2">
          <Select value={selectedSubmodel} onValueChange={setSelectedSubmodel}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-cyan-900/50 text-cyan-400">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-cyan-900/50">
              {submodels[selectedModel].map((submodel) => (
                <SelectItem
                  key={submodel}
                  value={submodel}
                  className="text-gray-300 hover:text-cyan-400 hover:bg-gray-800"
                >
                  {submodel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {remainingTokens <= 0 && (
            <Button variant="destructive" className="ml-auto">
              Upgrade Plan
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${selectedModel}...`}
            className="resize-none bg-gray-900 border-cyan-900/50 text-gray-300 focus:border-cyan-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || remainingTokens <= 0}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || remainingTokens <= 0}
            className="bg-cyan-700 hover:bg-cyan-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
