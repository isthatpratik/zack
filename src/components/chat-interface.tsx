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
import {
  Terminal,
  Send,
  Bot,
  AlertCircle,
  Plus,
  History,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { createClient } from "../../supabase/client";
import {
  estimateTokens,
  recordTokenUsage,
  checkTokenAvailability,
} from "../utils/token-utils";

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

interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Update submodel when main model changes and load token usage
  useEffect(() => {
    // Reset the submodel to the first one in the list when the main model changes
    setSelectedSubmodel(submodels[selectedModel][0]);

    // Load user's token usage from the database
    const loadTokenUsage = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { tokensUsed, tokenLimit, remaining } =
            await checkTokenAvailability(userData.user.id);
          setRemainingTokens(remaining);
        }
      } catch (error) {
        console.error("Error loading token usage:", error);
      }
    };

    loadTokenUsage();
  }, [selectedModel, supabase.auth]);

  // Load conversations from database
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from("conversations")
            .select("*")
            .order("updated_at", { ascending: false });

          if (error) throw error;

          if (data) {
            const formattedConversations = data.map((conv) => ({
              ...conv,
              messages: [],
              created_at: new Date(conv.created_at),
              updated_at: new Date(conv.updated_at),
            }));
            setConversations(formattedConversations);
          }
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    loadConversations();

    // Set up realtime subscription for conversations
    const conversationsSubscription = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          loadConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
    };
  }, [supabase]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Use the token estimation utility from token-utils.ts
  const estimateTokensForModel = (text: string) => {
    return estimateTokens(text, selectedModel);
  };

  // Auto-save the conversation to the database
  const saveConversation = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Check if user has access to history based on their plan
      const { data: userPlan } = await supabase
        .from("users")
        .select("plan_id")
        .eq("id", userData.user.id)
        .single();

      // If user is on free plan (no plan_id or plan_id for free tier), don't save
      if (!userPlan?.plan_id) {
        return null;
      }

      // Generate a title from the first user message
      const firstUserMessage = messages.find((m) => m.role === "user");
      let title = firstUserMessage
        ? firstUserMessage.content.substring(0, 50)
        : "New Conversation";
      if (title.length === 50) title += "...";

      let conversationId = currentConversationId;

      // If no current conversation, create a new one
      if (!conversationId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: userData.user.id,
            title,
            model: `${selectedModel}-${selectedSubmodel}`,
          })
          .select("id")
          .single();

        if (error) throw error;
        conversationId = data.id;
        setCurrentConversationId(conversationId);
      } else {
        // Update existing conversation
        const { error } = await supabase
          .from("conversations")
          .update({
            title,
            model: `${selectedModel}-${selectedSubmodel}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

        if (error) throw error;
      }

      // Save all messages
      const messagesToSave = messages.map((msg) => ({
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }));

      // First delete existing messages for this conversation
      await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      // Then insert all current messages
      const { error: messagesError } = await supabase
        .from("messages")
        .insert(messagesToSave);

      if (messagesError) throw messagesError;

      return conversationId;
    } catch (error) {
      console.error("Error saving conversation:", error);
      return null;
    }
  };

  // Load a conversation
  const loadConversation = async (conversationId: string) => {
    try {
      // Get conversation details
      const { data: conversationData, error: conversationError } =
        await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

      if (conversationError) throw conversationError;

      // Get messages for this conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true });

      if (messagesError) throw messagesError;

      // Format messages
      const formattedMessages = messagesData.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));

      // Update state
      setMessages(formattedMessages);
      setCurrentConversationId(conversationId);

      // Set model based on conversation data
      const [model, submodel] = (
        conversationData.model || "openai-GPT-3.5"
      ).split("-");
      if (model && submodels[model as AIModel]) {
        if (onModelChange) onModelChange(model as AIModel);
        setSelectedSubmodel(submodel || submodels[model as AIModel][0]);
      }

      // Close history panel after loading
      setShowHistory(false);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    // If there are messages in the current chat, save it first
    if (messages.length > 1 && currentConversationId) {
      await saveConversation();
    }

    // Reset the chat
    setMessages([
      {
        role: "system",
        content: "Welcome to Rovyk Terminal. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  // Delete a conversation
  const deleteConversation = async (
    conversationId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Prevent triggering the loadConversation

    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      // If the deleted conversation is the current one, create a new chat
      if (conversationId === currentConversationId) {
        createNewChat();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Estimate tokens for this message based on the selected model
    const estimatedTokens = estimateTokensForModel(input);

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

    // Call the actual AI API based on the selected model
    try {
      // Call our API route that handles the different AI providers
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          submodel: selectedSubmodel,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from AI");
      }

      const data = await response.json();
      const responseContent = data.content;
      const totalUsed = data.tokens || estimatedTokens;

      const aiMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setRemainingTokens((prev) => prev - totalUsed);

      // Auto-save the conversation after each message exchange
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await saveConversation();
        }
      } catch (error) {
        console.error("Error saving conversation:", error);
      }
    } catch (error: any) {
      console.error("Error calling AI API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Error: ${error.message || `Could not connect to ${selectedModel} API. Please try again later.`}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-900 text-gray-100 font-mono rounded-lg border border-cyan-900/30 overflow-hidden">
      {/* Chat header with token info and actions */}
      <div className="bg-gray-800 p-4 border-b border-cyan-900/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan-400" />
          <span className="text-cyan-400">Rovyk Terminal</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-2 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700"
                  onClick={createNewChat}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-gray-700"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat History</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

      {/* Main content area with history sidebar and chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat history sidebar */}
        {showHistory && (
          <div className="w-64 bg-gray-800 border-r border-cyan-900/30 flex flex-col">
            <div className="p-3 border-b border-cyan-900/30">
              <h3 className="text-sm font-semibold text-cyan-400">
                Chat History
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-xs text-gray-500 p-2">
                    No saved conversations
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-2 text-xs rounded cursor-pointer flex justify-between items-center group hover:bg-gray-700 ${currentConversationId === conversation.id ? "bg-gray-700" : ""}`}
                      onClick={() => loadConversation(conversation.id)}
                    >
                      <div className="truncate flex-1">
                        <div className="font-medium text-gray-300">
                          {conversation.title}
                        </div>
                        <div className="text-gray-500 text-[10px]">
                          {new Date(
                            conversation.updated_at,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                        onClick={(e) => deleteConversation(conversation.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

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
