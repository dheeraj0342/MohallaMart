import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/../../convex/_generated/api";

/**
 * Rider Location Tracking API
 * 
 * Since Next.js API routes don't support WebSocket upgrades natively,
 * we use POST for location updates and Server-Sent Events (SSE) for real-time streaming.
 * 
 * Clients can also use Convex subscriptions for real-time updates.
 * 
 * Usage:
 * - Update location: POST /api/ws/rider { riderId, lat, lon }
 * - Stream updates: GET /api/ws/rider?riderId=xxx (SSE)
 */

// In-memory connections for SSE (use Redis in production for scaling)
const sseConnections = new Map<string, ReadableStreamDefaultController[]>();

/**
 * POST /api/ws/rider
 * Update rider location
 * 
 * Body: { riderId: string, lat: number, lon: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { riderId, lat, lon } = body;

    if (!riderId || lat === undefined || lon === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: riderId, lat, lon" },
        { status: 400 }
      );
    }

    // Update location in Convex
    await fetchMutation(api.riders.updateLocation, {
      id: riderId as any,
      location: { lat, lon },
    });

    // Broadcast to all SSE connections tracking this rider
    const controllers = sseConnections.get(riderId) || [];
    const message = JSON.stringify({
      type: "location_update",
      riderId,
      location: { lat, lon },
      timestamp: Date.now(),
    });

    // Send to all active connections and filter out closed ones
    const activeControllers = controllers.filter((controller) => {
      try {
        controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
        return true;
      } catch (error) {
        // Connection closed, remove from list
        return false;
      }
    });

    // Update connections map with only active connections
    if (activeControllers.length > 0) {
      sseConnections.set(riderId, activeControllers);
    } else {
      sseConnections.delete(riderId);
    }

    return NextResponse.json({
      success: true,
      message: "Location updated",
    });
  } catch (err: any) {
    console.error("[Rider Location Update] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update location" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ws/rider?riderId=xxx
 * Server-Sent Events (SSE) stream for real-time location updates
 * 
 * Clients subscribe to this endpoint to receive real-time location updates
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const riderId = searchParams.get("riderId");

  if (!riderId) {
    return NextResponse.json(
      { error: "Missing riderId parameter" },
      { status: 400 }
    );
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add connection to map
      if (!sseConnections.has(riderId)) {
        sseConnections.set(riderId, []);
      }
      sseConnections.get(riderId)!.push(controller);

      // Send initial connection message
      const welcomeMessage = JSON.stringify({
        type: "connected",
        riderId,
        message: "Connected to rider location stream",
        timestamp: Date.now(),
      });
      controller.enqueue(new TextEncoder().encode(`data: ${welcomeMessage}\n\n`));

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          const pingMessage = JSON.stringify({
            type: "ping",
            timestamp: Date.now(),
          });
          controller.enqueue(new TextEncoder().encode(`data: ${pingMessage}\n\n`));
        } catch (error) {
          clearInterval(pingInterval);
          // Remove from connections
          const controllers = sseConnections.get(riderId);
          if (controllers) {
            sseConnections.set(
              riderId,
              controllers.filter((c) => c !== controller)
            );
          }
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        const controllers = sseConnections.get(riderId);
        if (controllers) {
          sseConnections.set(
            riderId,
            controllers.filter((c) => c !== controller)
          );
        }
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

