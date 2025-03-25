import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/server";
import {
  ArrowUpRight,
  Terminal,
  Bot,
  Cpu,
  Zap,
  Shield,
  Code,
  Database,
  History,
  MessageSquare,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-gray-800 border-t border-cyan-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">
              $ features --list
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Access multiple AI models through our retro terminal interface
              with token-based subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Bot className="w-6 h-6" />,
                title: "Multiple AI Models",
                description: "OpenAI, Claude, Grok, Gemini, Deepseek",
              },
              {
                icon: <Terminal className="w-6 h-6" />,
                title: "Terminal UI",
                description: "Retro terminal-inspired interface",
              },
              {
                icon: <Database className="w-6 h-6" />,
                title: "Token System",
                description: "Pay only for what you use",
              },
              {
                icon: <History className="w-6 h-6" />,
                title: "Chat History",
                description: "Save and categorize conversations",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-900 rounded-md border border-cyan-800/50 hover:border-cyan-400/50 transition-colors"
              >
                <div className="text-cyan-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section className="py-20 bg-gray-900 border-t border-cyan-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">
              $ supported_models
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Access the best AI models through a single interface
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-8 text-center max-w-5xl mx-auto">
            <div className="p-6 bg-gray-800 rounded-md border border-cyan-800/50">
              <Cpu className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
              <div className="text-xl font-bold mb-2 text-white">OpenAI</div>
              <div className="text-cyan-300 text-sm">GPT-3.5/4/4o</div>
            </div>
            <div className="p-6 bg-gray-800 rounded-md border border-cyan-800/50">
              <MessageSquare className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
              <div className="text-xl font-bold mb-2 text-white">Claude</div>
              <div className="text-cyan-300 text-sm">Opus/Sonnet/Haiku</div>
            </div>
            <div className="p-6 bg-gray-800 rounded-md border border-cyan-800/50">
              <Zap className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
              <div className="text-xl font-bold mb-2 text-white">Grok</div>
              <div className="text-cyan-300 text-sm">Grok-1</div>
            </div>
            <div className="p-6 bg-gray-800 rounded-md border border-cyan-800/50">
              <Shield className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
              <div className="text-xl font-bold mb-2 text-white">Gemini</div>
              <div className="text-cyan-300 text-sm">Pro/Ultra</div>
            </div>
            <div className="p-6 bg-gray-800 rounded-md border border-cyan-800/50">
              <Code className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
              <div className="text-xl font-bold mb-2 text-white">Deepseek</div>
              <div className="text-cyan-300 text-sm">Coder/Chat</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="py-24 bg-gray-800 border-t border-cyan-900/30"
        id="pricing"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">
              $ pricing --show
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Choose from three tiers: Free (5,000 tokens), Premium 1 ($8.99 for
              200K tokens), or Premium 2 ($14.99 for 500K tokens).
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                id: "free",
                name: "Free",
                description: "Basic access to AI models",
                price: "$0",
                features: [
                  "5,000 tokens",
                  "Access to all AI models",
                  "No conversation history",
                  "Basic support",
                ],
                highlight: false,
                buttonText: "Get Started",
              },
              {
                id: "premium1",
                name: "Premium 1",
                description: "Enhanced access with history",
                price: "$8.99",
                features: [
                  "200,000 tokens",
                  "Access to all AI models",
                  "Full conversation history",
                  "Priority support",
                ],
                highlight: true,
                buttonText: "Upgrade Now",
              },
              {
                id: "premium2",
                name: "Premium 2",
                description: "Maximum tokens for power users",
                price: "$14.99",
                features: [
                  "500,000 tokens",
                  "Access to all AI models",
                  "Full conversation history",
                  "Premium support",
                ],
                highlight: false,
                buttonText: "Upgrade Now",
              },
            ].map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 border-t border-cyan-900/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-cyan-400">
            $ init_session
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start chatting with multiple AI models through our terminal
            interface.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-gray-900 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors font-mono border-2 border-cyan-500"
          >
            $ start_session
            <Terminal className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
