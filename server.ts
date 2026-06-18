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

// Helper to generate UUID-like strings
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to run content generation with automated retry and fallback to gemini-3.1-flash-lite
async function generateContentWithFallback(params: {
  contents: any;
  config: any;
}): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  const maxAttempts = 3;
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Attempting generateContent using ${modelName} (Attempt ${attempt}/${maxAttempts})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        console.log(`[Gemini] Successfully completed generation using ${modelName}`);
        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini] Error with model ${modelName} on attempt ${attempt}:`, error.message || error);

        const errorStr = (error.message || "").toLowerCase();
        const isTransient = errorStr.includes("503") ||
                            errorStr.includes("unavailable") ||
                            errorStr.includes("high demand") ||
                            errorStr.includes("resource_exhausted") ||
                            errorStr.includes("429");

        if (!isTransient) {
          // If it is another type of error (like forbidden/unauthorized), propagate/fallback fast
          break;
        }

        if (attempt < maxAttempts) {
          const backoffTime = 1000 * attempt * 1.5;
          console.log(`[Gemini] Retrying in ${backoffTime}ms due to transient error...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
  }
  throw lastError;
}

// Helper to send chat message with automated retry and fallback to gemini-3.1-flash-lite
async function sendChatMessageWithFallback(params: {
  history: any;
  message: string;
}): Promise<any> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  const maxAttempts = 3;
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Attempting sendChatMessage using ${modelName} (Attempt ${attempt}/${maxAttempts})`);
        const chatInstance = ai.chats.create({
          model: modelName,
          history: params.history
        });
        const response = await chatInstance.sendMessage({ message: params.message });
        console.log(`[Gemini] Successfully sent chat message using ${modelName}`);
        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini] Chat error with model ${modelName} on attempt ${attempt}:`, error.message || error);

        const errorStr = (error.message || "").toLowerCase();
        const isTransient = errorStr.includes("503") ||
                            errorStr.includes("unavailable") ||
                            errorStr.includes("high demand") ||
                            errorStr.includes("resource_exhausted") ||
                            errorStr.includes("429");

        if (!isTransient) {
          break;
        }

        if (attempt < maxAttempts) {
          const backoffTime = 1000 * attempt * 1.5;
          console.log(`[Gemini] Retrying chat in ${backoffTime}ms due to transient error...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
  }
  throw lastError;
}

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV, hasApiKey: !!process.env.GEMINI_API_KEY });
});

app.post("/api/generate-agenda", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings." });
    }

    const { files = [], templateId = "auto" } = req.body;
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

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "Gemini API key is not configured on the server." });
    }

    const { files = [], agendaContext, messages = [], message = "" } = req.body;

    const fileParts = files.map((file: any) => ({
      inlineData: {
        mimeType: file.type,
        data: file.data
      }
    }));

    let contextText = "I have access to the meeting agenda.";
    if (agendaContext) {
      contextText += ` The meeting is "${agendaContext.title}". Summary: ${agendaContext.summary}.`;
    }

    const baseParts = [...fileParts];
    if (baseParts.length === 0) {
      baseParts.push({ text: contextText + " Please answer questions based on the generated agenda I just provided." });
    } else {
      baseParts.push({ text: contextText + " I have uploaded these documents. Please answer my future questions based on them and the agenda. Be concise and helpful." });
    }

    // Build history
    const history: any[] = [
      {
        role: "user",
        parts: baseParts
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to answer your questions about the meeting and documents." }]
      }
    ];

    // Append subsequent messages as conversational history, EXCEPT the latest user message
    messages.forEach((msg: any) => {
      if (msg.sender === "user") {
        history.push({
          role: "user",
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === "model") {
        history.push({
          role: "model",
          parts: [{ text: msg.text }]
        });
      }
    });

    const response = await sendChatMessageWithFallback({
      history,
      message
    });
    res.json({ text: response.text || "I couldn't generate a response." });

  } catch (error: any) {
    console.error("Server Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat message." });
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
