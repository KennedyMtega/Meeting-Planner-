import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MEETING_TEMPLATES } from "./types.js";

const app = express();
const PORT = 3000;

// Set up server parsing limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize GoogleGenAI client on backend
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "dummy-key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const agendaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the meeting" },
    summary: { type: Type.STRING, description: "A brief 1-2 sentence summary of the meeting's purpose" },
    startTime: { type: Type.STRING, description: "Suggested start time in 24h format e.g. '09:00'" },
    stakeholders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING, description: "Job title or role in meeting" },
          contact: { type: Type.STRING, description: "Email or department if available" }
        },
        required: ["name", "role"]
      },
      description: "List of people or roles involved"
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          durationMinutes: { type: Type.NUMBER, description: "Duration of this topic in minutes" },
          topic: { type: Type.STRING, description: "Main topic header" },
          description: { type: Type.STRING, description: "Details about what will be discussed" },
          suggestedSpeakerName: { type: Type.STRING, description: "Name of the stakeholder who should speak" },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 2-3 specific points to discuss or questions to answer"
          },
          expectedOutcome: { type: Type.STRING, description: "The specific goal, decision, or deliverable expected from this item" }
        },
        required: ["topic", "durationMinutes", "description"]
      }
    }
  },
  required: ["title", "stakeholders", "items", "startTime"]
};

// Simple in-memory rate limiting map
// Keys: IP addresses, Values: { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimiter = (limit: number, windowMs: number) => {
  return (req: any, res: any, next: any) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        error: "You are sending requests too quickly. Please wait a moment before trying again.",
        retryAfterMs: Math.max(0, record.resetTime - now)
      });
    }

    record.count += 1;
    next();
  };
};

// Simple in-memory lock map to prevent simultaneous multi-clicks with automatic timeout fallback
const activeRequestsLock = new Map<string, number>();

const concurrencyGuard = (req: any, res: any, next: any) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  const path = req.path;
  const lockKey = `${ip}:${path}`;
  const now = Date.now();

  const existingLockExpiration = activeRequestsLock.get(lockKey);
  if (existingLockExpiration && now < existingLockExpiration) {
    return res.status(409).json({
      error: "A request is already being processed for this action. Please wait until it completes."
    });
  }

  // Lock key for max 45 seconds to prevent stale states in case connection close events are lost
  activeRequestsLock.set(lockKey, now + 45000);

  const releaseLock = () => {
    activeRequestsLock.delete(lockKey);
  };

  res.on('finish', releaseLock);
  res.on('close', releaseLock);
  res.on('error', releaseLock);

  next();
};

// Helper to generate UUID-like strings
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to run content generation with automated retry and fallback to gemini-3.1-flash-lite/gemini-flash-latest
async function generateContentWithFallback(params: {
  contents: any;
  config: any;
}): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini] Attempting generateContent using ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config,
      });
      console.log(`[Gemini] Successfully completed generation using ${modelName}`);
      return response;
    } catch (error: any) {
      lastError = error;
      const originalMessage = error.message || "";
      console.log(`[Gemini] Model ${modelName} is currently busy or unavailable:`, originalMessage || error);

      let errorDetails = "";
      try {
        errorDetails = JSON.stringify(error);
      } catch (e) {
        errorDetails = String(error);
      }
      const errorStr = `${originalMessage} ${errorDetails} ${error}`.toLowerCase();
      
      // If it is an API key or auth error, propagate instantly
      const isAuthError = errorStr.includes("api key") || 
                          errorStr.includes("apikey") || 
                          errorStr.includes("unauthorized") || 
                          errorStr.includes("forbidden") || 
                          errorStr.includes("key_invalid") || 
                          errorStr.includes("key is invalid") ||
                          errorStr.includes("refused") ||
                          errorStr.includes("keyNotAssociatedWithProject");

      if (isAuthError) {
        throw error;
      }
    }
  }

  // If we exhausted all options, make a final attempt with gemini-flash-latest after a tiny delay
  console.log("[Gemini] First-pass fallback failed. Pausing 1.5s before final retry with gemini-flash-latest...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  try {
    console.log(`[Gemini] Attempting final fallback retry using gemini-flash-latest`);
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: params.contents,
      config: params.config,
    });
    console.log(`[Gemini] Successfully completed generation on final fallback pass`);
    return response;
  } catch (error: any) {
    console.error("[Gemini] All fallback methods failed:", error.message || error);
    throw lastError || error;
  }
}

// Helper to send chat message with automated retry and fallback to gemini-3.1-flash-lite/gemini-flash-latest
async function sendChatMessageWithFallback(params: {
  history: any;
  message: string;
}): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini] Attempting sendChatMessage using ${modelName}`);
      const chatInstance = ai.chats.create({
        model: modelName,
        history: params.history
      });
      const response = await chatInstance.sendMessage({ message: params.message });
      console.log(`[Gemini] Successfully sent chat message using ${modelName}`);
      return response;
    } catch (error: any) {
      lastError = error;
      const originalMessage = error.message || "";
      console.log(`[Gemini] Model ${modelName} is busy or unavailable for chat:`, originalMessage || error);

      let errorDetails = "";
      try {
        errorDetails = JSON.stringify(error);
      } catch (e) {
        errorDetails = String(error);
      }
      const errorStr = `${originalMessage} ${errorDetails} ${error}`.toLowerCase();
      
      // If it is an API key or auth error, propagate instantly
      const isAuthError = errorStr.includes("api key") || 
                          errorStr.includes("apikey") || 
                          errorStr.includes("unauthorized") || 
                          errorStr.includes("forbidden") || 
                          errorStr.includes("key_invalid") || 
                          errorStr.includes("key is invalid") ||
                          errorStr.includes("refused") ||
                          errorStr.includes("keyNotAssociatedWithProject");

      if (isAuthError) {
        throw error;
      }
    }
  }

  // If all failed, retry once on gemini-flash-latest with a short delay
  console.log("[Gemini] Chat fallback failed. Pausing 1.5s before final chat fallback retry...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  try {
    console.log(`[Gemini] Attempting final fallback chat retry using gemini-flash-latest`);
    const chatInstance = ai.chats.create({
      model: "gemini-flash-latest",
      history: params.history
    });
    const response = await chatInstance.sendMessage({ message: params.message });
    console.log(`[Gemini] Successfully completed final chat on fallback pass`);
    return response;
  } catch (error: any) {
    console.error("[Gemini] Chat fallback final retry failed:", error.message || error);
    throw lastError || error;
  }
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV, hasApiKey: !!process.env.GEMINI_API_KEY });
});

app.post("/api/generate-agenda", rateLimiter(15, 60000), concurrencyGuard, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings." });
    }

    const { files = [], templateId = "auto", customInstructions = "" } = req.body;
    const selectedTemplate = MEETING_TEMPLATES.find((t: any) => t.id === templateId) || MEETING_TEMPLATES[0];
    const hasFiles = files.length > 0;

    let promptText = "";
    if (hasFiles) {
      promptText = "Analyze these documents (which may include reports, surveys, plans, etc.) and generate ONE unified, structured meeting agenda. ";
      if (templateId !== 'auto') {
        promptText += `\\n\\nIMPORTANT: You MUST structure the meeting agenda according to the '${selectedTemplate.name}' template. The required structure is: ${selectedTemplate.structure}. Map the content from the documents into this specific structure. `;
      } else {
        promptText += "Synthesize information from all provided files. ";
      }
      promptText += "Identify key stakeholders (with roles), topics to discuss, and estimate time for each based on the content complexity. Include key discussion points and expected outcomes for each topic.";
    } else {
      promptText = `Generate a realistic, comprehensive example agenda for a '${selectedTemplate.name}' meeting. \\n\\nThe structure MUST be: ${selectedTemplate.structure}. \\n\\nCreate realistic placeholder content, topics, descriptions, and stakeholders that would typically appear in this type of meeting. Ensure the duration is appropriate for a ${selectedTemplate.name}.`;
    }

    if (customInstructions && customInstructions.trim()) {
      promptText += `\n\nCRITICAL USER GUIDELINES / KEY FOCUS POINTS:\nYou MUST strictly adhere to the following direct manual constraints or focus areas requested by the user:\n"${customInstructions.trim()}"`;
    }

    const fileParts = files.map((file: any) => ({
      inlineData: {
        mimeType: file.type,
        data: file.data
      }
    }));

    const response = await generateContentWithFallback({
      contents: {
        parts: [
          ...fileParts,
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: agendaSchema,
        temperature: hasFiles ? 0.4 : 0.7,
      }
    });

    if (!response.text) {
      throw new Error("No text response received from Gemini model.");
    }

    const rawData = JSON.parse(response.text);

    // Add unique IDs and structure as frontend expects
    const stakeholders = (rawData.stakeholders || []).map((s: any) => ({
      id: generateId(),
      name: s.name,
      role: s.role,
      contact: s.contact || ''
    }));

    const items = (rawData.items || []).map((item: any) => {
      const matchedStakeholder = stakeholders.find((s: any) => 
        item.suggestedSpeakerName && s.name.toLowerCase().includes(item.suggestedSpeakerName.toLowerCase())
      );
      return {
        id: generateId(),
        topic: item.topic,
        description: item.description,
        durationMinutes: item.durationMinutes,
        speakerIds: matchedStakeholder ? [matchedStakeholder.id] : [],
        keyPoints: item.keyPoints || [],
        expectedOutcome: item.expectedOutcome || ''
      };
    });

    res.json({
      title: rawData.title,
      summary: rawData.summary,
      startTime: rawData.startTime || "09:00",
      stakeholders,
      items
    });
  } catch (error: any) {
    console.error("Server Agenda Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate agenda." });
  }
});

app.post("/api/suggest-next-item", rateLimiter(15, 60000), concurrencyGuard, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is not configured on the server. Please check Settings." });
    }

    const { agendaContext, existingItems = [] } = req.body;
    let promptText = `Given a meeting titled "${agendaContext?.title || 'Meeting'}" with purpose: "${agendaContext?.summary || 'Collaboration'}".\n`;
    promptText += `The current agenda has the following topics already:\n`;
    existingItems.forEach((it: any, index: number) => {
      promptText += `${index+1}. ${it.topic} (${it.durationMinutes}m) - ${it.description}\n`;
    });
    promptText += `\nGenerate the next logical topic/session that should be discussed in this meeting to make it successful.
Include:
1. A descriptive, professional topic header
2. Detailed description of what to discuss next
3. Estimated duration in minutes (usually between 10 to 30 minutes)
4. 2-3 specific points to address during discussion
5. An expected concrete outcome of this session.
Return as a JSON object matching this schema.`;

    const singleItemSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        durationMinutes: { type: Type.NUMBER, description: "Duration of this suggested topic in minutes" },
        topic: { type: Type.STRING, description: "Descriptive topic header" },
        description: { type: Type.STRING, description: "Details about what will be discussed" },
        keyPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 2-3 specific points to address during this block"
        },
        expectedOutcome: { type: Type.STRING, description: "The specific goal or outcome expected" }
      },
      required: ["topic", "durationMinutes", "description"]
    };

    const response = await generateContentWithFallback({
      contents: {
        parts: [{ text: promptText }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: singleItemSchema,
        temperature: 0.7,
      }
    });

    if (!response.text) {
      throw new Error("No suggestion text received from Gemini.");
    }

    const rawItem = JSON.parse(response.text);
    res.json({
      id: generateId(),
      topic: rawItem.topic || "Suggested Topic",
      description: rawItem.description || "Suggested details of discussion.",
      durationMinutes: rawItem.durationMinutes || 15,
      speakerIds: [],
      keyPoints: rawItem.keyPoints || [],
      expectedOutcome: rawItem.expectedOutcome || ""
    });
  } catch (error: any) {
    console.error("Server suggest-next-item Error:", error);
    res.status(500).json({ error: error.message || "Failed to suggest the next item." });
  }
});

// Setup dev server or static distribution build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

startServer();
