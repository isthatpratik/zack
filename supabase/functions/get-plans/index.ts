// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Define the pricing plans
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

    return new Response(JSON.stringify(plans), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
