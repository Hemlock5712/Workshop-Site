import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GoogleGenAI } from "@google/genai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { z } from "zod";

// Type for vector search result chunks
interface ChunkResult {
  pageTitle: string;
  section?: string;
  pageUrl: string;
  content: string;
}

// Initialize clients
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!geminiApiKey) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY not configured");
}

if (!convexUrl) {
  console.error("NEXT_PUBLIC_CONVEX_URL not configured");
}

// Only initialize Convex if URL is configured and not a placeholder
const isValidConvexUrl =
  convexUrl &&
  convexUrl !== "YOUR_CONVEX_URL_HERE" &&
  (convexUrl.startsWith("https://") || convexUrl.startsWith("http://"));

const convex = isValidConvexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(req: Request) {
  try {
    const { messages, customApiKey } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages array is required", { status: 400 });
    }

    // Use custom API key if provided, otherwise fall back to environment variable
    const activeApiKey = customApiKey || geminiApiKey;

    if (!activeApiKey) {
      return new Response(
        JSON.stringify({
          error: "API key required",
          details:
            "Please provide an API key or configure GOOGLE_GENERATIVE_AI_API_KEY environment variable",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // Create Google AI provider with the active API key
    const googleAI = createGoogleGenerativeAI({
      apiKey: activeApiKey,
    });

    const result = streamText({
      model: googleAI("gemini-2.5-pro"),
      messages: modelMessages,
      stopWhen: stepCountIs(5),
      system: `You are an expert FRC (FIRST Robotics Competition) programming assistant for the Gray Matter Workshop.
You help teams learn command-based programming, hardware setup, PID tuning, and robot control systems.

CRITICAL INSTRUCTIONS:
- You MUST use the searchWorkshopContent tool for EVERY question to retrieve relevant workshop content.
- ALWAYS call the tool first before answering - this workshop has specific content you need to access.
- After retrieving content with the tool, base your answer on the context provided.
- Do NOT answer without using the tool, even if the question seems simple.

When users ask questions:
1. IMMEDIATELY use the searchWorkshopContent tool with a relevant query
2. Review the retrieved content from the tool
3. Provide clear, technical answers based on the retrieved content
4. Reference specific workshop pages or documentation sources when relevant
5. Use code examples when explaining concepts
6. Be encouraging and educational - this is for learning teams

## Response Guidelines
- Format responses with proper markdown
- Use **bold** for emphasis, not backticks for general terms
- Use backticks only for code values like \`kP\`, \`setVoltage()\`, method names, etc.
- Include URLs when referencing workshop pages (e.g., "/hardware", "/pid-control")
- For hardware questions, reference CTRE/WPILib documentation appropriately

## Workshop Context
- Workshop uses CTRE Phoenix 6 hardware (Kraken motors, CANcoders, CANivore)
- Programming language: Java with WPILib
- Framework: Command-based programming
- Workshop code repository: https://github.com/Hemlock5712/Workshop-Code`,
      tools: {
        searchWorkshopContent: {
          description:
            "Search the FRC Programming Workshop content, external documentation (CTRE, WPILib, PathPlanner, Limelight, PhotonVision), and code examples. Use this tool to find relevant information to answer user questions.",
          inputSchema: z.object({
            query: z
              .string()
              .describe("The search query to find relevant workshop content"),
            limit: z
              .number()
              .optional()
              .describe("Number of results to return (default: 5)"),
          }),
          execute: async ({ query, limit = 5 }) => {
            if (!convex) {
              throw new Error("Convex not configured");
            }

            try {
              // Use custom API key for embeddings if provided
              const embeddingClient = new GoogleGenAI({ apiKey: activeApiKey });

              // Generate embedding for the query
              const embeddingResult = await embeddingClient.models.embedContent(
                {
                  model: "gemini-embedding-001",
                  contents: query,
                }
              );

              const embedding = embeddingResult.embeddings?.[0]?.values || [];

              if (embedding.length === 0) {
                return {
                  results: [],
                  context: "",
                  message: "Failed to generate query embedding.",
                };
              }

              // Search Convex vector database directly
              const chunks = await convex.action(api.chunks.vectorSearch, {
                embedding,
                limit,
              });

              if (!chunks || chunks.length === 0) {
                return {
                  results: [],
                  context: "",
                  message: "No relevant content found for this query.",
                };
              }

              // Build context from chunks
              const context = chunks
                .map((chunk: ChunkResult, idx: number) => {
                  const header = `## Source ${idx + 1}: ${chunk.pageTitle}${
                    chunk.section ? ` - ${chunk.section}` : ""
                  }`;
                  const url = `URL: ${chunk.pageUrl}`;
                  return `${header}\n${url}\n\n${chunk.content}`;
                })
                .join("\n\n---\n\n");

              // Return simple string with context for the AI to use
              const toolResult = `Found ${chunks.length} relevant workshop sources:\n\n${context}`;

              return toolResult;
            } catch (error) {
              console.error("Search tool error:", error);
              return {
                results: [],
                context: "",
                message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              };
            }
          },
        },
      },
      temperature: 0.7,
    });
    // Use UI message stream (not text stream) to support tool calls
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
