import Navbar from "@/components/navbar";
import PricingCard from "@/components/pricing-card";
import { createClient } from "../../../supabase/server";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define the pricing plans directly
  const plans = [
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
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((item: any) => (
            <PricingCard key={item.id} item={item} user={user} />
          ))}
        </div>
      </div>
    </>
  );
}
