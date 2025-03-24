"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { AlertCircle, Zap } from "lucide-react";

interface TokenDisplayProps {
  tokenLimit: number;
  tokensUsed: number;
  onUpgrade?: () => void;
}

export default function TokenDisplay({
  tokenLimit = 5000,
  tokensUsed = 0,
  onUpgrade,
}: TokenDisplayProps) {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    setPercentage(Math.min(100, (tokensUsed / tokenLimit) * 100));
  }, [tokensUsed, tokenLimit]);

  const remaining = tokenLimit - tokensUsed;
  const isLow = remaining < tokenLimit * 0.1; // Less than 10% remaining

  return (
    <Card className="bg-gray-800 border-cyan-900/30">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-200">
              Token Usage
            </span>
          </div>
          <span className="text-sm text-gray-400">
            {tokensUsed} / {tokenLimit}
          </span>
        </div>

        <Progress
          value={percentage}
          className="h-2 mb-3"
          indicatorClassName={isLow ? "bg-red-500" : "bg-cyan-500"}
        />

        {isLow && (
          <div className="flex items-center gap-2 mb-3 text-xs text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            <span>Running low on tokens</span>
          </div>
        )}

        {remaining <= 0 && (
          <Button
            onClick={onUpgrade}
            className="w-full mt-2 bg-cyan-700 hover:bg-cyan-600 text-white"
            size="sm"
          >
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
