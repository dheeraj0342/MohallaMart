import { serveHandler } from "@/lib/inngest/serve";
import { NextRequest, NextResponse } from "next/server";

// Wrapper function to handle errors
const handleInngestRequest = async (request: NextRequest, method: string) => {
  try {
    // Check if required environment variables are present
    if (!process.env.INNGEST_SIGNING_KEY) {
      console.error("INNGEST_SIGNING_KEY is missing");
      return NextResponse.json(
        { error: "Inngest configuration error" },
        { status: 500 },
      );
    }

    // Get the appropriate handler method
    const handler = serveHandler[method as keyof typeof serveHandler];
    if (!handler) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 },
      );
    }

    // Call the handler
    return await handler(request, {});
  } catch (error) {
    console.error("Inngest API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

// Export the serve handler methods with error handling
export const GET = (request: NextRequest) =>
  handleInngestRequest(request, "GET");
export const POST = (request: NextRequest) =>
  handleInngestRequest(request, "POST");
export const PUT = (request: NextRequest) =>
  handleInngestRequest(request, "PUT");
