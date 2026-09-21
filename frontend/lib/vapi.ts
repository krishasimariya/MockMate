import Vapi from "@vapi-ai/web";

export const createVapiInstance = (customKey?: string): Vapi => {
  if (typeof window === "undefined") {
    throw new Error("Vapi can only be initialized on the client side.");
  }

  const key = customKey || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
  return new Vapi(key);
};

export const getVapi = (customKey?: string): Vapi => {
  return createVapiInstance(customKey);
};
