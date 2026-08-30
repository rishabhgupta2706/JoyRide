const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://127.0.0.1:11434";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL ||
    "qwen2.5:3b";

const parseUserPreferences = async (prompt) => {
    const systemPrompt = `
You are a bike rental preference parser.

Read the user's message and return ONLY valid JSON.

Return exactly:

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
- location should be the city or place mentioned by the user.
- category must be one of:
  commuter, cruiser, roadster, sport, adventure, touring
  or null if unclear.
- comfortable, comfort, relaxed or smooth means comfort=true.
- cheap, cheapest, affordable, economical means cheap=true.
- premium, luxury, expensive, high-end means premium=true.
- purpose should briefly describe the user's intended use.
- Never invent information.
- Never include markdown.
- Never explain your answer.
- Return JSON only.
`;

    try {
        const response = await fetch(
            `${OLLAMA_URL}/api/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: OLLAMA_MODEL,
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
            }
        );

        if (!response.ok) {
            throw new Error(
                `Ollama request failed with status ${response.status}`
            );
        }

        const data =
            await response.json();

        const content =
            data.message?.content;

        if (!content) {
            throw new Error(
                "Ollama returned an empty response."
            );
        }

        let preferences;

        try {
            preferences =
                JSON.parse(content);
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
                    ? preferences.category
                        .toLowerCase()
                        .trim()
                    : null,

            purpose:
                typeof preferences.purpose === "string"
                    ? preferences.purpose.trim()
                    : null,

            comfort:
                Boolean(
                    preferences.comfort
                ),

            cheap:
                Boolean(
                    preferences.cheap
                ),

            premium:
                Boolean(
                    preferences.premium
                )
        };

    } catch (error) {
        console.error(
            "OLLAMA SERVICE ERROR:",
            error.message
        );

        throw error;
    }
};


module.exports = {
    parseUserPreferences
};