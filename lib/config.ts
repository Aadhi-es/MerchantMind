export const CONFIG = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zhgwvlcgemaqziumcytm.supabase.co",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TY3hrFcvANCKTI",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "ukoEY30AZi6HOV5b0icLD1RA",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "will_set_later",
  },
  gemini: {
    apiKey: process.env.GOOGLE_AI_API_KEY || "",
    // Primary model: Google Gemini 3.5 Flash Lite
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  },
  merchant: {
    name: "MerchantMind",
    currency: "INR",
    supportEmail: "support@merchantmind.ai",
  },
};
