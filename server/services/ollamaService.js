const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

const parseUserPreferences = async (prompt) => {
    const systemPrompt = `
You are a bike rental preference parser.

Your job is to read the user's message and return ONLY valid JSON.

Return exactly this structure:

{
  "budget": number or null,
  "location": string or null,
  "category": string or null,
  "purpose": string or null,
  "comfort": boolean,
  "cheap": boolean,
  "premium": boolean
}

Rules:
- budget means maximum price per hour.
- location should be the city/place mentioned by the user.
- category should be one of:
  commuter, cruiser, roadster, sport, adventure, touring
  or null if unclear.
- comfortable/comfort/relaxed should set comfort=true.
- cheap/budget/affordable/economical should set cheap=true.
- premium/luxury/high-end/powerful should set premium=true.
- purpose should briefly describe the use case, such as:
  city commute, long trip, highway ride, college commute, adventure ride.
- Never invent information.
- Never include markdown.
- Never explain your answer.
- Return JSON only.
`;

    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "qwen2.5:3b",
            stream: false,
            format: "json",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(
            `Ollama request failed with status ${response.status}`
        );
    }

    const data = await response.json();

    const content = data.message?.content;

    if (!content) {
        throw new Error("Ollama returned an empty response.");
    }

    let preferences;

    try {
        preferences = JSON.parse(content);
    } catch (error) {
        throw new Error(
            "Ollama returned invalid JSON."
        );
    }

    return {
        budget:
            typeof preferences.budget === "number"
                ? preferences.budget
                : null,

        location:
            typeof preferences.location === "string"
                ? preferences.location.trim()
                : null,

        category:
            typeof preferences.category === "string"
                ? preferences.category.toLowerCase().trim()
                : null,

        purpose:
            typeof preferences.purpose === "string"
                ? preferences.purpose.trim()
                : null,

        comfort:
            Boolean(preferences.comfort),

        cheap:
            Boolean(preferences.cheap),

        premium:
            Boolean(preferences.premium)
    };
};

module.exports = {
    parseUserPreferences
};