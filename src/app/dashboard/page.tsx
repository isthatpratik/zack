import { createClient } from "../../../supabase/server";
import { InfoIcon, UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import DashboardNavbar from "@/components/dashboard-navbar";
import ChatInterface from "@/components/chat-interface";
import TokenDisplay from "@/components/token-display";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // In a real app, you would fetch the user's token usage from the database
  // For now, we'll simulate with a fixed value
  const tokensUsed = 1200; // Example value
  const tokenLimit = 5000; // Free tier limit

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* User Profile Card */}
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-900/30">
              <div className="flex items-center gap-3 mb-3">
                <UserCircle size={40} className="text-cyan-400" />
                <div>
                  <h3 className="font-medium text-gray-200">
                    {user.user_metadata?.full_name || "User"}
                  </h3>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-700">
                <p>User ID: {user.id.substring(0, 8)}...</p>
              </div>
            </div>

            {/* Token Usage Card */}
            <TokenDisplay tokenLimit={tokenLimit} tokensUsed={tokensUsed} />

            {/* Info Card */}
            <div className="bg-gray-800 rounded-lg p-4 border border-cyan-900/30 text-sm">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">
                <InfoIcon size={16} />
                <h3 className="font-medium">Free Tier</h3>
              </div>
              <p className="text-gray-400 text-xs">
                You have access to 5,000 tokens with your free account. Upgrade
                to Premium for more tokens and features.
              </p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <ChatInterface
              selectedModel="openai"
              tokenLimit={tokenLimit}
              tokensUsed={tokensUsed}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
