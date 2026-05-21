import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages array is required", { status: 400 });
    }

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "Server misconfigured",
          details: "GOOGLE_GENERATIVE_AI_API_KEY is not set",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelMessages = await convertToModelMessages(messages);

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
