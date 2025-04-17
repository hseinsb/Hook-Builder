// Import OpenAI
import OpenAI from "openai";
import { openAIConfig } from "../config";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openAIConfig.apiKey,
  dangerouslyAllowBrowser: true, // This is needed for client-side usage
});

/**
 * Analyzes a hook using OpenAI based on the T.R.I.P. framework
 * @param {Object} hookData - Hook data with hook, context, emotion, theme, tone
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeHook = async (hookData) => {
  try {
    // Extract hook data
    const { hook, context, emotion, theme, tone } = hookData;

    // Create the prompt for OpenAI
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(hook, context, emotion, theme, tone);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;

    // Parse the response into our format
    return parseOpenAIResponse(content, hook);
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Failed to analyze hook. Please try again.");
  }
};

/**
 * Builds the system prompt for OpenAI
 * @returns {string} - The system prompt
 */
const buildSystemPrompt = () => {
  return `You are an expert scriptwriter assistant for TikTok video creators who specialize in two-character, cinematic, dialogue-driven videos about deep emotional and philosophical topics.

Your task is to analyze the first line of a video script (the "hook") based on the T.R.I.P. framework, which evaluates hooks on four key dimensions:

T - Tension: Introduces emotional, spiritual, or psychological conflict or friction
R - Relatability: Reflects a common struggle or silent pain the audience feels
I - Intrigue: Opens a mental loop that demands resolution
P - Personal Stakes: Feels like a raw emotional confession or real moment

For each hook, you'll provide:
1. A rating out of 10 based on how many T.R.I.P. elements it hits and how effectively
2. A breakdown showing which specific T.R.I.P. elements are present or missing
3. Brief feedback on what works well and what could be improved
4. Three refined variations that preserve the creator's voice and emotional tone
5. Optionally, a suggestion for reframing or approaching the hook differently

Important guidelines:
- Preserve the creator's raw, authentic voice - avoid polished marketing speak
- Focus on emotional depth rather than viral potential
- Maintain the character-driven dialogue style (not narrator voice)
- Keep refined hooks punchy and concise (suitable for 1-3 seconds)
- Make sure hooks relate to themes like growth, religion, masculinity, morality, etc.

Your analysis should help creators maintain their authentic voice while optimizing their hooks for emotional impact and audience retention.

Format your response in the following way:
{
  "score": 7,
  "tripBreakdown": {
    "tension": true,
    "relatability": true,
    "intrigue": false,
    "personalStakes": true
  },
  "feedback": "Feedback text here...",
  "variations": [
    "Variation 1 here",
    "Variation 2 here",
    "Variation 3 here"
  ],
  "reframePrompt": "Optional reframe suggestion here"
}`;
};

/**
 * Builds the user prompt for OpenAI
 * @param {string} hook - The hook to analyze
 * @param {string} context - The context of the scene
 * @param {string} emotion - The primary emotion
 * @param {string} theme - The primary theme
 * @param {string} tone - The tone (optional)
 * @returns {string} - The user prompt
 */
const buildUserPrompt = (hook, context, emotion, theme, tone) => {
  let prompt = `Please analyze this TikTok video hook:

Hook: "${hook}"

Scene Context: ${context}

Emotion: ${emotion}
Theme: ${theme}`;

  if (tone) {
    prompt += `\nTone: ${tone}`;
  }

  prompt += `\n\nPlease provide your analysis based on the T.R.I.P. framework as described.`;

  return prompt;
};

/**
 * Parses the OpenAI response into our format
 * @param {string} content - The response content from OpenAI
 * @param {string} originalHook - The original hook that was analyzed
 * @returns {Object} - The parsed response
 */
const parseOpenAIResponse = (content, originalHook) => {
  try {
    // Try to parse the JSON response
    const parsed = JSON.parse(content);

    // Add the original hook to the response
    return {
      ...parsed,
      originalHook,
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error, content);

    // If parsing fails, return a formatted error
    return {
      originalHook,
      score: 0,
      tripBreakdown: {
        tension: false,
        relatability: false,
        intrigue: false,
        personalStakes: false,
      },
      feedback:
        "Sorry, there was an error analyzing your hook. Please try again.",
      variations: [],
      reframePrompt: null,
    };
  }
};
