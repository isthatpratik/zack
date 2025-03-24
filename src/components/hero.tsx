import Link from "next/link";
import { ArrowUpRight, Check, Terminal, Bot, Cpu, Zap } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gray-900">
      {/* Background gradient with terminal-like effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Terminal className="w-16 h-16 text-cyan-400" />
            </div>
            <h1 className="font-mono text-5xl sm:text-6xl font-bold text-white mb-8 tracking-tight">
              <span className="text-cyan-400">Rovyk</span>: Multi-AI Chat
              <span className="block mt-2 text-cyan-300">Terminal</span>
            </h1>

            <p className="font-mono text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Access multiple AI models in one retro terminal interface. OpenAI,
              Claude, Grok, Gemini, and Deepseek - all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="font-mono inline-flex items-center px-8 py-4 text-gray-900 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors text-lg font-medium border-2 border-cyan-500"
              >
                $ start_session
                <Terminal className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="font-mono inline-flex items-center px-8 py-4 text-cyan-400 bg-transparent rounded-md hover:bg-gray-800 transition-colors text-lg font-medium border-2 border-cyan-500"
              >
                $ view_pricing
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-300 font-mono">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>Free tier: 5,000 tokens included</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>Multiple AI models</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>Save conversations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
