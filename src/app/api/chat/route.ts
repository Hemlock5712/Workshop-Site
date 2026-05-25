import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import * as v from "valibot";

/**
 * Inbound schema for the AI assistant route.
 *
 * Validates the shape that comes off the wire from the @ai-sdk/react useChat
 * hook before we hand it to convertToModelMessages. Catches typos/malformed
 * payloads here so the downstream call gets a clean shape and the client gets
 * a 400 instead of a 500. UIMessage parts are deeply heterogeneous in the AI
 * SDK; we only assert the outer structure (role + parts array).
 */
const ChatRequestSchema = v.object({
  messages: v.array(
    v.object({
      role: v.picklist(["user", "assistant", "system"]),
      parts: v.optional(v.array(v.unknown())),
      content: v.optional(v.unknown()),
      id: v.optional(v.string()),
    })
  ),
});

const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const fileSearchStore = process.env.GEMINI_FILE_SEARCH_STORE;

if (!geminiApiKey) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY not configured");
}

if (!fileSearchStore) {
  console.error("GEMINI_FILE_SEARCH_STORE not configured — RAG disabled");
}

const SYSTEM_PROMPT = `You are an expert FRC (FIRST Robotics Competition) programming assistant for the Gray Matter Workshop.
You help teams learn command-based programming, hardware setup, PID tuning, and robot control systems.

## Tool Use
- Use the file_search tool for any question about workshop content, FRC concepts, CTRE/WPILib usage, programming patterns, or hardware setup. The workshop has specific guidance that supersedes general knowledge.
- Skip file_search only for pure greetings ("hi", "thanks") or meta questions about you ("what can you do?").
- After file_search returns, ground your answer in the retrieved content. Cite the source URL (e.g. /pid-control) when you reference workshop material.

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
- Workshop code repository: https://github.com/Hemlock5712/Workshop-Code`;

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = v.safeParse(ChatRequestSchema, raw);
    if (!parsed.success) {
      const issue = parsed.issues[0];
      return new Response(
        JSON.stringify({
          error: "Invalid chat request shape",
          details: issue
            ? `${issue.path?.map((p) => p.key).join(".") ?? "<root>"}: ${issue.message}`
            : "messages array required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { messages } = parsed.output;

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "Server misconfigured",
          details: "GOOGLE_GENERATIVE_AI_API_KEY is not set",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // valibot gates the outer envelope; the AI SDK does its own deep
    // validation of UIMessagePart shapes downstream, so we cast through here.
    const modelMessages = await convertToModelMessages(
      messages as unknown as UIMessage[]
    );

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiApiKey });

    const tools = fileSearchStore
      ? {
          file_search: googleAI.tools.fileSearch({
            fileSearchStoreNames: [fileSearchStore],
            topK: 8,
          }),
        }
      : undefined;

    const result = streamText({
      model: googleAI("gemini-3.1-flash-lite"),
      messages: modelMessages,
      system: SYSTEM_PROMPT,
      stopWhen: stepCountIs(5),
      tools,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse({
      onError: (err) => {
        console.error("Chat stream error:", err);
        return err instanceof Error ? err.message : String(err);
      },
    });
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
