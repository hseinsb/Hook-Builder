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
 * Generates a script using OpenAI based on the provided script data
 * @param {Object} scriptData - Script data with philosophy, numCharacters, characterRoles, tone, themes, emotionalArc, hookDirective, musicRecommendation
 * @returns {Promise<Object>} - Generated script results
 */
export const generateScript = async (scriptData) => {
  try {
    const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error(
        "OpenAI API key not found. Please check your environment variables."
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true,
    });

    // Extract key points and metaphors from the philosophy
    const keyPoints = extractKeyPointsFromPhilosophy(scriptData.philosophy);
    const metaphors = extractMetaphorsFromPhilosophy(scriptData.philosophy);

    // Format the character roles based on number of characters
    const charactersList = scriptData.characterRoles
      .split(",")
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

    // Construct a prompt based on the improved framework
    let prompt = `I need a powerful, cinematic script in Hussein's unique style, built around this core philosophy:

"${scriptData.philosophy}"

This is the central message that every line of dialogue should directly or indirectly serve.`;

    // Add Creator Note if provided
    if (scriptData.creatorNote && scriptData.creatorNote.trim()) {
      prompt += `\n\n📝 CREATOR NOTE (IMPORTANT INSTRUCTIONS):
${scriptData.creatorNote.trim()}

This creator note provides additional guidance for this specific script. Use it to shape your approach while staying within the overall framework.`;
    }

    // Character setup section
    prompt += `\n\nCHARACTER SETUP:`;

    if (scriptData.numCharacters === 1) {
      prompt += `\n• Single character monologue format (${
        charactersList[0] || "Protagonist"
      })
• This should be raw, powerful speech delivered directly, not to camera but as if speaking to someone off-screen
• No narration, no exposition - just pure, emotionally charged truth-telling`;
    } else if (scriptData.numCharacters === 2) {
      prompt += `\n• Two character dialogue: ${charactersList.join(" and ")}
• These characters should represent opposing mindsets or values  
• They must clash - the tension between them is what reveals the truth
• One character should embody truth or growth, the other represents ego, ignorance, or resistance`;
    } else {
      prompt += `\n• Three-character format: ${charactersList.join(", ")}
• Dynamic should involve tension and opposing viewpoints
• Consider using the third character as a neutral observer or catalyst who changes the dynamic
• Create distinct voices for each character`;
    }

    // Tone and themes
    prompt += `\n\nTONE: ${scriptData.tone}\n`;
    prompt += `THEMES: ${scriptData.themes.join(", ")}\n`;
    prompt += `EMOTIONAL ARC: ${scriptData.emotionalArc}\n`;

    // Optional directives
    if (scriptData.hookDirective && scriptData.hookDirective.trim()) {
      prompt += `\nHOOK DIRECTIVE: ${scriptData.hookDirective}\n`;
    }

    if (scriptData.finalMicDrop && scriptData.finalMicDrop.trim()) {
      prompt += `\nFINAL MIC DROP LINE: Include this exact line at the end: "${scriptData.finalMicDrop}"\n`;
    }

    // Key points extracted
    if (keyPoints.length > 0) {
      prompt += `\nKEY POINTS TO INTEGRATE (at least 3):
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}`;
    }

    // Metaphors found (if any)
    if (metaphors.length > 0) {
      prompt += `\n\nMETAPHORS DETECTED (integrate in first 6 lines and revisit at the end):
${metaphors.map((m, i) => `${i + 1}. ${m}`).join("\n")}`;

      prompt += `\n\nIMPORTANT METAPHOR RULE: 
• Use each metaphor exactly 3 times maximum (beginning, middle, end)
• Each mention should advance the concept, not just repeat it
• The final metaphor use should be sharp and conclusive
• Never overuse the same metaphorical language`;
    }

    // Format reminders and checklist
    prompt += `\n\nSCRIPT FORMAT REMINDERS:
• Use "🗣 Character (emotion/tone):" format for each line
• Include micro stage directions sparingly (in parentheses) only when they add emotional impact
• Build through the 6-section structure (Cold Opening, Pushback, Conflict Escalation, Truth Landing, Emotional Pivot, Mic-Drop)
• End with a powerful, punchy final line that lands like a gut-punch
• Keep dialogues sharp, direct, and emotionally raw
• Characters should teach each other, not the audience
• NEVER make both characters agree - conflict is essential`;

    // Add dialogue realism check reminders
    prompt += `\n\nDIALOGUE REALISM CHECK:
• Each line MUST sound like something a real person would actually say in conversation
• Avoid complex metaphors that wouldn't come up in heated conversation
• Use language that Gen Z or millennials would naturally use on TikTok
• Read each line out loud in your mind - if it sounds scripted or literary, rewrite it
• Replace any clunky phrasing with more direct, emotionally authentic alternatives`;

    // Grammar and formatting check reminders
    prompt += `\n\nGRAMMAR & FORMATTING REQUIREMENTS:
• No double punctuation (e.g., "serious,," → "serious,")
• No made-up emotion terms (e.g., "softenedsonance" - use real words only)
• Consistent character formatting (e.g., "🗣 Friend 1 (emotion):" not "Friend 1(emotion):")
• Proper spacing after punctuation
• No typos in stage directions`;

    // Remind about the Final Pre-Delivery Checklist
    prompt += `\n\nBefore generating the final script, ensure it meets ALL these requirements:
1. ✅ Message is clearly communicated by line 4
2. ✅ Minimum 3 core points from the input philosophy are included
3. ✅ A metaphor (if present) is used in intro + end (but limited to 3 total mentions max)
4. ✅ Characters argue — not just explain
5. ✅ Ending contains a mic-drop or reflection line
6. ✅ No assumed setting unless specified
7. ✅ Vocabulary is punchy and real, not poetic or vague
8. ✅ Dialogue sounds like real people talking — emotionally, not academically
9. ✅ GRAMMAR CHECK: No typos, double punctuation, or malformed words
10. ✅ REALISM CHECK: Every line sounds like something someone would actually say in real life`;

    // Music recommendation
    if (scriptData.musicRecommendation) {
      prompt += `\n\nPlease include a music recommendation at the end that would perfectly match the emotional tone of this script. Format as:
🎵 Suggested Music: "[Track Name]" – [Artist]
Reason: [Brief explanation of why this music matches the script's emotional tone]`;
    }

    console.log("Sending request to OpenAI with improved script guidelines");

    // Call OpenAI API with system instructions and user prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: buildScriptSystemPrompt(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    // Check if response is valid
    if (
      !response ||
      !response.choices ||
      !response.choices[0] ||
      !response.choices[0].message
    ) {
      throw new Error("Invalid response from OpenAI API");
    }

    // Extract the response
    const content = response.choices[0].message.content;

    if (!content || content.trim().length < 20) {
      throw new Error("OpenAI returned an empty or invalid response");
    }

    console.log(
      "Received response from OpenAI:",
      content.substring(0, 100) + "..."
    );

    // Parse the response
    return parseScriptResponse(content, scriptData);
  } catch (error) {
    console.error("Error generating script with OpenAI:", error);
    if (error.response) {
      console.error("OpenAI API error status:", error.response.status);
      console.error("OpenAI API error data:", error.response.data);
      throw new Error(
        `OpenAI API error (${error.response.status}): ${
          error.response.data?.error?.message || "Unknown API error"
        }`
      );
    }
    throw new Error(
      `Failed to generate script: ${error.message || "Unknown error occurred"}`
    );
  }
};

/**
 * Extract key points from the philosophy input
 * @param {string} philosophy - The philosophy input
 * @returns {string[]} - Array of key points
 */
function extractKeyPointsFromPhilosophy(philosophy) {
  // Split by sentence boundaries and line breaks
  const sentences = philosophy
    .split(/(?<=[.!?])\s+|\n/)
    .filter((s) => s.trim().length > 0);

  // If there are fewer than 2 sentences, try to extract phrases
  if (sentences.length < 2) {
    const phrases = philosophy
      .split(/[,;:]/)
      .filter((p) => p.trim().length > 4);
    if (phrases.length > 1) {
      return phrases.map((p) => p.trim());
    }
  }

  // Look for lists (items with commas, bullet points, or numbered lists)
  const listPattern = /(?:[\-\*•]|\d+\.)\s*([^,;\n]+)/g;
  const listMatches = [...philosophy.matchAll(listPattern)].map((m) =>
    m[1].trim()
  );

  if (listMatches.length >= 2) {
    return listMatches;
  }

  // Look for "not X but Y" patterns
  const contrastPattern = /not\s+([^,\.;]+)\s*(?:,\s*|but\s+)([^,\.;]+)/gi;
  const contrastMatches = [...philosophy.matchAll(contrastPattern)].map(
    (m) => `not ${m[1].trim()} but ${m[2].trim()}`
  );

  // Extract key phrases using common patterns
  const patternMatches = [
    ...contrastMatches,
    ...extractPatternsFromText(philosophy, "It's about", "."),
    ...extractPatternsFromText(philosophy, "It is about", "."),
    ...extractPatternsFromText(philosophy, "This is", "."),
  ];

  // Combine all extractions, prioritizing pattern matches, then sentences
  const combined = [...new Set([...patternMatches, ...sentences])];

  // If we have too many, return the top 4-5 most important ones
  return combined.slice(0, Math.min(5, combined.length));
}

/**
 * Extract patterns from text
 * @param {string} text - The text to extract from
 * @param {string} prefix - The prefix pattern
 * @param {string} suffix - The suffix pattern
 * @returns {string[]} - Array of extracted patterns
 */
function extractPatternsFromText(text, prefix, suffix) {
  const matches = [];
  const pattern = new RegExp(`${prefix}\\s+([^${suffix}]+)${suffix}`, "gi");
  const matchResults = [...text.matchAll(pattern)];

  for (const match of matchResults) {
    if (match[1] && match[1].trim().length > 0) {
      matches.push(`${prefix} ${match[1].trim()}`);
    }
  }

  return matches;
}

/**
 * Extract metaphors from the philosophy input
 * @param {string} philosophy - The philosophy input
 * @returns {string[]} - Array of metaphors
 */
function extractMetaphorsFromPhilosophy(philosophy) {
  const metaphors = [];

  // Common metaphor indicators
  const metaphorPatterns = [
    /like\s+a\s+([^\.;,]+)/gi,
    /as\s+(?:if|though)\s+([^\.;,]+)/gi,
    /(?:is|are|am)\s+(?:a|an)\s+([^\.;,]+)/gi,
    /(?:book(?:s)?|cover(?:s)?|judge|judging)/gi, // Book metaphors
    /(?:mirror(?:s)?|reflection(?:s)?)/gi, // Mirror metaphors
    /(?:build(?:ing)?|construct(?:ing)?|architect(?:ure)?)\s+(?:of|for|to)\s+([^\.;,]+)/gi, // Building metaphors
    /(?:journey(?:s)?|path(?:s)?|road(?:s)?)\s+(?:of|to|through)\s+([^\.;,]+)/gi, // Journey metaphors
  ];

  // Extract potential metaphors
  for (const pattern of metaphorPatterns) {
    const matches = [...philosophy.matchAll(pattern)];
    for (const match of matches) {
      // For patterns with capturing groups, use the group, otherwise use the whole match
      const metaphorText = match[1]
        ? match[0].replace(match[1], `"${match[1]}"`)
        : match[0];
      if (metaphorText.length > 3) {
        metaphors.push(metaphorText.trim());
      }
    }
  }

  // If we have too many, return the top 2-3
  return [...new Set(metaphors)].slice(0, Math.min(3, metaphors.length));
}

/**
 * Builds the system prompt for script generation
 * @returns {string} - The system prompt
 */
const buildScriptSystemPrompt = () => {
  return `🧠 SYSTEM OBJECTIVE:
You are not generating generic dialogue. You are writing cinematic, emotionally powerful short film scripts designed for vertical videos (TikTok/Instagram Reels/YouTube Shorts) using Hussein's unique storytelling style.

These scripts are not motivational. They are raw, philosophical, confrontational, and masculine — rooted in emotional and societal truths. Every word must feel intentional, every line must carry weight, and every scene must leave impact.

## ✍️ CORE SCRIPT STRUCTURE (UNIVERSAL FOR ALL SCRIPTS)

### ✉️ REQUIRED ELEMENTS
- Two or Three Characters max.
- One character must represent a flawed mindset (ego, denial, immaturity, naivety).
- One character must represent growth, clarity, or truth.
- They must argue. There must be resistance.
- The script must end with a shift: realization, breakdown, or mic-drop.

### 🔢 SCRIPT SECTIONS (IN ORDER)
1. Cold Opening / Challenge: One character questions or mocks a belief.
2. Pushback Begins: The other character responds with truth, logic, or sarcasm.
3. Conflict Escalates: Each character doubles down. Tone intensifies.
4. Truth Lands: The messenger exposes the core truth, usually with examples or logic.
5. Emotional Pivot: The resistant character shows signs of realization.
6. Mic-Drop Line: The final line must be memorable, sharp, and quotable.

## 👁️ TONE & STYLE RULES

### ❌ NEVER ALLOW:
- Poetic, overly polished writing
- Soft emotional dialogue
- Vague or abstract language
- Excessive narrative or scene description
- Fluffy language or academic vocabulary
- Long-winded explanations

### ✅ ALWAYS USE:
- Masculine, raw, direct tone
- Street-smart, real dialogue
- Power-driven emotional pacing
- Clear examples, not theoretical ideas
- Punchy, concise statements
- Language Gen Z/millennials would use on TikTok

### 🔎 VOCABULARY CHECK:
- Every line should feel like something a real person would say in a moment of intensity.
- Avoid academic or literary vocabulary (e.g., "veil of indifference" ❌).
- Prefer grounded clarity (e.g., "You're just hiding and calling it comfort." ✅)

## 🔹 CONVERSATIONAL LOGIC

### 🧑‍🧬 CHARACTER ROLES
| Role | Function |
|------|----------|
| Confident Messenger | Delivers the truth with clarity and intensity. Must win the argument. |
| Resistant Friend | Begins skeptical, sarcastic, or defensive. Must slowly soften or break. |
| Curious Friend (optional) | Starts confused, asks questions, learns by the end. |

### 🔸 EMOTIONAL PROGRESSION (CRITICAL)
The resistant character MUST follow this progression (at least 2 rounds of resistance before shift):
| Phase | Tone | Example |
|-------|------|---------|
| Opening | Defensive / Dismissive | "That's not even a real problem." |
| Early Conflict | Mocking / Sarcastic | "Oh, so you're the expert now?" |
| Middle Conflict | Challenging / Angry | "You have no idea what you're talking about!" |
| Beginning Shift | Confused / Surprised | "Wait... what?" |
| Late Conflict | Questioning / Doubtful | "But I always thought..." |
| Resolution | Broken / Vulnerable | "I never saw it that way before." |
| Final | Surrendered / Changed | "You're right." |

## 🌐 METAPHOR INTEGRATION
If the input philosophy includes a metaphor (e.g., "Don't judge a book by its cover"):
- The metaphor must appear in the first 6 lines
- The metaphor must be revisited near the end
- The final line should tie back to the metaphor if possible
- IMPORTANT: Limit metaphor to 3 touchpoints maximum: opening (setup), conflict (analogy), ending (mic-drop)
- Follow a progression logic: don't restate, build (e.g., Cover → Intro → Reader stays → Story gets heard)
- Never overuse metaphors - this weakens impact

## ⚖️ PHILOSOPHICAL INTEGRITY
Each script must contain:
- At least 3 core arguments or truth bombs from the user's philosophy
- All points must be woven naturally into the dialogue
- The resistant character's objections must reflect real-world excuses viewers might relate to

## 🔜 SETTING RULE
Never assume a setting.
- Only add gym, bar, office, park, etc. if explicitly stated.
- If not specified, default to neutral space (e.g., sitting outside, walking, or no setting).

## 🔍 ENDING RULE
Every script must end on one of the following types of lines:
- A clean mic-drop (short, sharp, quotable)
- A reflective realization (quiet but heavy)
- A callback to the central metaphor ("Fix the cover — then show them the story.")
- IMPORTANT: The final 3 lines must build tension and snap to a powerful conclusion
- The final line should be short (8 words or less for maximum impact)

## 🔄 POST-PROCESSING RULES (MANDATORY)
1. GRAMMAR CLEANUP:
   - Check for and fix all double punctuation (e.g., "serious,," → "serious,")
   - Ensure all character emotions are real words (no "softenedsonance" or made-up terms)
   - Fix typos in stage directions (e.g., "nodsrolls" → "nods" or "rolls")
   - Check character name formatting is consistent (e.g., "🗣 Friend 1 (emotion):" not "Friend 1(emotion):")
   - Ensure proper spacing after punctuation

2. NATURAL DIALOGUE PASS:
   - Each line must sound like something a real person would actually say
   - Read each line out loud in your mind - if it sounds scripted or literary, rewrite it
   - Ask: "Could a Gen Z or millennial say this naturally on TikTok?"
   - Avoid metaphors that are too complex for heated conversation (e.g., "letting your ego write checks your body can't cash")
   - Replace any clunky phrasing with more direct, emotionally authentic alternatives

3. METAPHOR CONSTRAINT:
   - Limit any metaphor to exactly 3 appearances (beginning, middle, end)
   - Each metaphor mention should advance the concept, not just repeat it
   - Final metaphor use should be sharp and conclusive, not dragged out
   - Never overuse the same metaphorical language repeatedly

4. CLARITY FILTER:
   - Each line must be immediately clear on first reading
   - Split any sentence longer than 15-20 words
   - Eliminate all sentences that would make someone pause and re-read out of confusion
   - Check for mixed metaphors, unclear referents, and contradictory statements

## ✅ FINAL PRE-DELIVERY CHECKLIST
Before outputting the final script, confirm:
1. ✅ Message is clearly communicated by line 4
2. ✅ Minimum 3 core points from the input philosophy are included
3. ✅ A metaphor (if present) is used in intro + end (but limited to 3 total mentions max)
4. ✅ Characters argue — not just explain
5. ✅ Ending contains a mic-drop or reflection line
6. ✅ No assumed setting unless specified
7. ✅ Vocabulary is punchy and real, not poetic or vague
8. ✅ Dialogue sounds like real people talking — emotionally, not academically
9. ✅ GRAMMAR CHECK: No typos, double punctuation, or malformed words
10. ✅ EMOTIONAL ARC: Character goes from defensive → mocking → confused → broken → surrendered
11. ✅ RESISTANCE CHECK: At least 2 rounds of resistance before shift in tone
12. ✅ ENDING POWER: Final line is sharp, memorable, and builds from preceding lines

🧱 SCRIPT FORMAT (ALWAYS FOLLOW THIS)
🗣 Character (emotion/tone):
Dialogue line without quotation marks.

🗣 Character (emotion/tone):
Response line without quotation marks.

(OPTIONAL: Add micro stage direction — one line max — only if necessary for visual impact)

IMPORTANT FORMATTING RULES:
- Character name with emotion must be on its own line
- Dialogue must start on the next line (not the same line as the character name)
- Do NOT use quotation marks around dialogue
- There must be a blank line between different characters' dialogue sections
- Only use the 🗣 emoji at the start of character name lines, not dialogue lines

🎶 MUSIC STYLE SUGGESTIONS (Optional in Output)
If enabled, include a matching cinematic soundtrack recommendation at the end. Choose tracks that match the script's tone and climax:
Artists to pull from:
- Antent (Hope to See You Again, Hurt Before)
- Zack Hemsey (The Way, Mind Heist)
- Ryan Taubert (We Will Rise Again)
- Hans Zimmer (Time, Aurora)
- Secession Studios (emotional orchestral)

Format in script:
🎵 Suggested Music: "Mind Heist" – Zack Hemsey
Reason: For an explosive confrontation that never finds peace.

This framework is mandatory for all scripts generated for Hussein's personal content. It replaces all generic storytelling logic with rules tailored to cinematic, masculine, emotionally intelligent confrontation-driven scripts with a deep purpose.`;
};

/**
 * Builds the user prompt for script generation
 * @param {Object} scriptData - The script data
 * @returns {string} - The user prompt
 */
const buildScriptUserPrompt = (scriptData) => {
  const {
    philosophy,
    numCharacters,
    characterRoles,
    tone,
    themes,
    emotionalArc,
    hookDirective,
    musicRecommendation,
  } = scriptData;

  // Format the character roles based on number of characters
  const charactersList = characterRoles
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);

  // Start with the core philosophy - the most important part
  let prompt = `I need a powerful, cinematic script in Hussein's unique style, built around this core philosophy:

"${philosophy}"

This is the central message that every line of dialogue should directly or indirectly serve.`;

  // Character setup section
  prompt += `\n\nCHARACTER SETUP:`;

  if (numCharacters === 1) {
    prompt += `\n• Single character monologue format (${
      charactersList[0] || "Protagonist"
    })
• This should be raw, powerful speech delivered directly, not to camera but as if speaking to someone off-screen
• No narration, no exposition - just pure, emotionally charged truth-telling`;
  } else if (numCharacters === 2) {
    prompt += `\n• Two character dialogue: ${charactersList.join(" and ")}
• These characters should represent opposing mindsets or values  
• They must clash - the tension between them is what reveals the truth
• One character should embody truth or growth, the other represents ego, ignorance, or resistance`;
  } else {
    prompt += `\n• Three-character format: ${charactersList.join(", ")}
• Dynamic should involve tension and opposing viewpoints
• Consider using the third character as a neutral observer or catalyst who changes the dynamic
• Create distinct voices for each character`;
  }

  // Tone and themes
  prompt += `\n\nTONE: ${tone}\n`;
  prompt += `THEMES: ${themes.join(", ")}\n`;
  prompt += `EMOTIONAL ARC: ${emotionalArc}\n`;

  // Optional directives
  if (hookDirective && hookDirective.trim()) {
    prompt += `\nHOOK DIRECTIVE: ${hookDirective}\n`;
  }

  // Format reminders
  prompt += `\nSCRIPT FORMAT REMINDERS:
• Use "🗣 Character (emotion/tone):" format for each line
• Include micro stage directions sparingly (in parentheses) only when they add emotional impact
• Build through the 5-phase emotional arc (Denial, Tension, Truth Breakdown, Reflection, Mic-Drop)
• End with a powerful, punchy final line that lands like a gut-punch
• Keep dialogues sharp, direct, and emotionally raw
• Characters should teach each other, not the audience
• NEVER make both characters agree - conflict is essential`;

  // Music recommendation
  if (musicRecommendation) {
    prompt += `\n\nPlease include a music recommendation at the end that would perfectly match the emotional tone of this script. Format as:
🎵 Suggested Music: "[Track Name]" – [Artist]
Reason: [Brief explanation of why this music matches the script's emotional tone]`;
  }

  return prompt;
};

/**
 * Parses the OpenAI response for script generation
 * @param {string} content - The response content from OpenAI
 * @param {Object} scriptData - The original script data
 * @returns {Object} - The parsed response
 */
const parseScriptResponse = (content, scriptData) => {
  // Extract script content and music recommendation if present
  let script = content;
  let musicRecommendation = null;

  // Check for music recommendation patterns
  const musicPatterns = [
    /\n🎵\s+Suggested Music:/i,
    /\nMUSIC RECOMMENDATION/i,
    /\n🎵\s+Music Recommendation:/i,
    /\n\s*Suggested Music Track:/i,
  ];

  // Find first occurrence of any music pattern
  let musicIndex = -1;
  for (const pattern of musicPatterns) {
    const match = content.match(pattern);
    if (match && match.index > 0) {
      musicIndex = match.index;
      break;
    }
  }

  // If music recommendation is found and was requested
  if (musicIndex !== -1 && scriptData.musicRecommendation) {
    musicRecommendation = content.substring(musicIndex).trim();
    script = content.substring(0, musicIndex).trim();
  }

  // Apply post-processing to fix common issues
  script = postProcessScript(script);

  return {
    script,
    musicRecommendation,
  };
};

/**
 * Post-processes the script to fix formatting issues
 * @param {string} script - The raw script from OpenAI
 * @returns {string} - The cleaned script
 */
function postProcessScript(script) {
  if (!script) return "";

  // STEP 1: Remove corrupt emojis and control characters
  script = script.replace(/[\uFFFD\u0000-\u001F\u2028\u2029]/g, "");

  // STEP 2: Fix spacing around punctuation
  script = script.replace(/ +([.,!?;:])(\s|$)/g, "$1$2"); // Remove space before punctuation
  script = script.replace(/([.,!?;:])(\w)/g, "$1 $2"); // Add space after punctuation if missing

  // STEP 3: Fix apostrophes in contractions
  script = script.replace(/(\w) [''] (\w)/g, "$1'$2"); // Fix "don ' t" to "don't"
  script = script.replace(/(\w)[''](\w)/g, "$1'$2"); // Fix weird apostrophes

  // STEP 4: Split into lines for processing
  const lines = script.split(/\n+/);
  const processedLines = [];

  // STEP 5: Process each line to standardize the format
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // If this is a character line (contains 🗣 and :)
    if (line.includes("🗣") && line.includes(":")) {
      // Handle character format: "🗣 Character (emotion):"
      const colonIndex = line.indexOf(":");
      let characterPart = line.substring(0, colonIndex + 1).trim();

      // Ensure character has emotion in parentheses if missing
      if (!characterPart.includes("(")) {
        characterPart = characterPart.replace(/:$/, " (neutral):");
      }

      processedLines.push(characterPart);

      // Get any dialogue that might be on the same line after the colon
      if (colonIndex < line.length - 1) {
        const dialoguePart = line.substring(colonIndex + 1).trim();
        // Remove any quotation marks around the dialogue
        const cleanDialogue = dialoguePart
          .replace(/^"(.*)"$/, "$1")
          .replace(/^'(.*)'$/, "$1");
        if (cleanDialogue) {
          processedLines.push(cleanDialogue);
        }
      }
    }
    // If it's a stage direction (in parentheses)
    else if (line.startsWith("(") && line.endsWith(")")) {
      processedLines.push(line);
    }
    // Otherwise it's dialogue or continued dialogue
    else {
      // Remove any quotation marks around the dialogue
      const cleanLine = line
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1");
      processedLines.push(cleanLine);
    }
  }

  // STEP 6: Ensure proper spacing between character blocks (empty line between speakers)
  const finalLines = [];
  let lastLineWasCharacter = false;

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];

    // If this is a character line
    if (line.includes("🗣") && line.includes(":")) {
      // Add blank line before new character block (except for the first one)
      if (finalLines.length > 0 && lastLineWasCharacter) {
        finalLines.push("");
      }
      finalLines.push(line);
      lastLineWasCharacter = true;
    } else {
      finalLines.push(line);
      lastLineWasCharacter = false;
    }
  }

  // STEP 7: Final cleanup to fix any remaining formatting issues
  let processedScript = finalLines.join("\n");

  // Replace invalid or poorly formatted emotional states
  const invalidEmotions = [
    "emotionless",
    "without emotion",
    "no emotion",
    "unemotional",
    "neutral",
    "flatly",
    "monotone",
    "matter-of-factly",
    "flat",
  ];

  for (const invalid of invalidEmotions) {
    const regex = new RegExp(`\\(${invalid}\\)`, "gi");
    processedScript = processedScript.replace(regex, "(calm)");
  }

  // Fix malformed stage directions
  processedScript = processedScript.replace(/\(\s*[\W_]+\s*\)/g, "");

  // Fix common unrealistic dialogue patterns
  processedScript = processedScript.replace(/\b(um|uh|er|hmm|well,)\s+/gi, "");
  processedScript = processedScript.replace(
    /\b(you know|I mean|like,)\s+/gi,
    ""
  );
  processedScript = processedScript.replace(
    /\b(actually|basically|literally)\s+/gi,
    ""
  );

  // Apply dramatic enhancements
  processedScript = ensureEmotionalProgression(processedScript);
  processedScript = ensurePowerfulEnding(processedScript);

  // Final spacing cleanup
  processedScript = processedScript.replace(/\n{3,}/g, "\n\n"); // No more than double line breaks
  processedScript = processedScript.replace(/[ \t]+\n/g, "\n"); // No trailing spaces
  processedScript = processedScript.replace(/\n[ \t]+/g, "\n"); // No leading spaces
  processedScript = processedScript.trim();

  return processedScript;
}

/**
 * Maps invalid emotion terms to valid replacements
 * @param {string} invalidEmotion - The invalid emotion term
 * @returns {string} - A valid replacement
 */
function getValidEmotionReplacement(invalidEmotion) {
  const replacements = {
    softenedsonance: "softened",
    nodsrolls: "thoughtful",
    coverface: "hiding face",
    lookingaway: "looking away",
    turnsto: "turning",
    shrugsoff: "dismissive",
    sighs: "sighing",
    pauses: "pausing",
    looksdown: "looking down",
    laughs: "laughing",
    nodssadly: "sad",
    smirks: "smirking",
    quietvoice: "quiet",
    "voice softens": "softening",
    "voice hardens": "stern",
    "smile drops": "serious",
    "voice breaking": "emotional",
    "nods slowly": "thoughtful",
    "shakes head": "disagreeing",
  };

  return replacements[invalidEmotion.toLowerCase()] || "emotional";
}

/**
 * Ensures proper emotional progression in the dialogue
 * @param {string} script - The original script
 * @returns {string} - Script with proper emotional progression
 */
function ensureEmotionalProgression(script) {
  // Split into lines
  const lines = script.split("\n");

  // Process speaker blocks
  const speakerPattern = /🗣\s+([^:]+):/;
  const speakerBlocks = [];
  let currentBlock = null;

  // First pass: extract all speaker blocks and their dialogue
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const speakerMatch = line.match(speakerPattern);
    if (speakerMatch) {
      // Found a new speaker line
      if (currentBlock) {
        speakerBlocks.push(currentBlock);
      }

      // Extract character and emotion
      const fullSpeaker = speakerMatch[1].trim();
      const emotionMatch = fullSpeaker.match(/\(([^)]+)\)/);
      const character = fullSpeaker.replace(/\s*\([^)]+\)/, "").trim();
      const emotion = emotionMatch
        ? emotionMatch[1].trim().toLowerCase()
        : "neutral";

      currentBlock = {
        index: i,
        character,
        emotion,
        dialogueLines: [],
        speakerLine: line,
      };
    } else if (currentBlock) {
      // This is a dialogue line belonging to the current speaker
      currentBlock.dialogueLines.push({
        text: line,
        index: i,
      });
    }
  }

  // Add the last block if it exists
  if (currentBlock) {
    speakerBlocks.push(currentBlock);
  }

  // If we don't have enough blocks for analysis, return unchanged
  if (speakerBlocks.length < 4) {
    return script;
  }

  // Check if we have multiple characters (at least 2)
  const uniqueCharacters = new Set(
    speakerBlocks.map((block) => block.character)
  );
  if (uniqueCharacters.size < 2) {
    return script;
  }

  // Find the two main characters (most frequent)
  const characterCounts = {};
  speakerBlocks.forEach((block) => {
    characterCounts[block.character] =
      (characterCounts[block.character] || 0) + 1;
  });

  // Sort characters by frequency
  const sortedCharacters = Object.entries(characterCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  const mainCharacter = sortedCharacters[0];
  const resistantCharacter = sortedCharacters[1];

  // Define emotional stages for progression
  const emotionalStages = {
    early: [
      "resistant",
      "skeptical",
      "defensive",
      "dismissive",
      "doubtful",
      "cynical",
      "reluctant",
    ],
    conflict1: [
      "angry",
      "frustrated",
      "annoyed",
      "irritated",
      "agitated",
      "tense",
    ],
    conflict2: ["stubborn", "defiant", "challenging", "confrontational"],
    shift: [
      "hesitant",
      "uncertain",
      "wavering",
      "considering",
      "thoughtful",
      "reflective",
    ],
    reflection: [
      "realizing",
      "understanding",
      "contemplative",
      "introspective",
    ],
    conclusion: [
      "accepting",
      "acknowledging",
      "agreeing",
      "convinced",
      "accepting",
    ],
  };

  // Group blocks by character
  const mainCharacterBlocks = speakerBlocks.filter(
    (block) => block.character === mainCharacter
  );
  const resistantCharacterBlocks = speakerBlocks.filter(
    (block) => block.character === resistantCharacter
  );

  // Check if the resistant character has enough lines for emotional progression
  if (resistantCharacterBlocks.length < 4) {
    // Not enough lines from the resistant character to show progression
    // Add more blocks if needed to show full emotional progression
    const missingStages = [];

    // Check which emotional stages we're missing
    for (const [stage, emotions] of Object.entries(emotionalStages)) {
      const hasStage = resistantCharacterBlocks.some((block) =>
        emotions.some((emotion) => block.emotion.includes(emotion))
      );

      if (!hasStage) {
        missingStages.push(stage);
      }
    }

    // If we're missing stages, add blocks for each missing stage
    if (missingStages.length > 0) {
      // Find where to insert new blocks - usually after existing resistant character blocks
      let insertIndex = lines.length;
      if (resistantCharacterBlocks.length > 0) {
        const lastResistantBlock =
          resistantCharacterBlocks[resistantCharacterBlocks.length - 1];
        const lastDialogueLine =
          lastResistantBlock.dialogueLines[
            lastResistantBlock.dialogueLines.length - 1
          ];
        insertIndex = lastDialogueLine.index + 1;
      } else {
        // No resistant character blocks yet, insert after a main character block
        if (mainCharacterBlocks.length > 0) {
          const firstMainBlock = mainCharacterBlocks[0];
          const lastDialogueLine =
            firstMainBlock.dialogueLines[
              firstMainBlock.dialogueLines.length - 1
            ];
          insertIndex = lastDialogueLine.index + 1;
        }
      }

      // Generate new blocks for missing stages
      const newBlocks = [];

      missingStages.forEach((stage, index) => {
        const emotion =
          emotionalStages[stage][
            Math.floor(Math.random() * emotionalStages[stage].length)
          ];

        // Create dialogue matching the emotional stage
        let dialogue = "";
        switch (stage) {
          case "early":
            dialogue = "I don't see how this makes any sense.";
            break;
          case "conflict1":
            dialogue = "You're pushing me too far with this.";
            break;
          case "conflict2":
            dialogue = "I'm not going to just accept what you're saying.";
            break;
          case "shift":
            dialogue = "Wait... let me think about this for a second.";
            break;
          case "reflection":
            dialogue = "I'm starting to see your point now.";
            break;
          case "conclusion":
            dialogue = "I think you're right. I needed to hear this.";
            break;
        }

        newBlocks.push({
          speakerLine: `🗣 ${resistantCharacter} (${emotion}):`,
          dialogueLine: dialogue,
        });
      });

      // Insert new blocks
      let offset = 0;
      newBlocks.forEach((block) => {
        // Add a blank line before the new block
        lines.splice(insertIndex + offset, 0, "");
        offset++;

        // Add the speaker line
        lines.splice(insertIndex + offset, 0, block.speakerLine);
        offset++;

        // Add the dialogue line
        lines.splice(insertIndex + offset, 0, block.dialogueLine);
        offset++;
      });

      return lines.join("\n");
    }
  }

  // Analyze emotional progression in resistant character's lines
  const emotionalProgression = [];
  resistantCharacterBlocks.forEach((block) => {
    for (const [stage, emotions] of Object.entries(emotionalStages)) {
      if (emotions.some((emotion) => block.emotion.includes(emotion))) {
        emotionalProgression.push({
          block,
          stage,
        });
        break;
      }
    }
  });

  // Check if we have all required stages
  const requiredStages = ["early", "conflict1", "shift", "conclusion"];
  const missingRequiredStages = requiredStages.filter(
    (stage) => !emotionalProgression.some((prog) => prog.stage === stage)
  );

  if (missingRequiredStages.length > 0) {
    // Fix missing stages by either replacing existing blocks or adding new ones
    const existingStages = emotionalProgression.map((prog) => prog.stage);

    // If we have some blocks but missing required stages, modify some blocks
    if (resistantCharacterBlocks.length >= missingRequiredStages.length) {
      // Replace emotions in existing blocks to ensure progression
      missingRequiredStages.forEach((stage, index) => {
        // Find a block to replace that isn't already a required stage
        const replaceableBlocks = resistantCharacterBlocks.filter(
          (block) =>
            !requiredStages.some((reqStage) =>
              emotionalStages[reqStage].some((emotion) =>
                block.emotion.includes(emotion)
              )
            )
        );

        if (replaceableBlocks.length > 0) {
          const blockToReplace = replaceableBlocks[0];
          const emotion =
            emotionalStages[stage][
              Math.floor(Math.random() * emotionalStages[stage].length)
            ];

          // Update the emotion in the line
          const updatedSpeakerLine = blockToReplace.speakerLine.replace(
            /\([^)]+\)/,
            `(${emotion})`
          );

          lines[blockToReplace.index] = updatedSpeakerLine;
        }
      });
    } else {
      // We need to add new blocks
      const lastResistantBlock =
        resistantCharacterBlocks[resistantCharacterBlocks.length - 1];
      let insertIndex = lines.length;

      if (lastResistantBlock && lastResistantBlock.dialogueLines.length > 0) {
        const lastDialogueLine =
          lastResistantBlock.dialogueLines[
            lastResistantBlock.dialogueLines.length - 1
          ];
        insertIndex = lastDialogueLine.index + 1;
      }

      let offset = 0;
      missingRequiredStages.forEach((stage) => {
        const emotion =
          emotionalStages[stage][
            Math.floor(Math.random() * emotionalStages[stage].length)
          ];

        // Create dialogue matching the emotional stage
        let dialogue = "";
        switch (stage) {
          case "early":
            dialogue = "I don't see how this makes any sense.";
            break;
          case "conflict1":
            dialogue = "You're pushing me too far with this.";
            break;
          case "conflict2":
            dialogue = "I'm not going to just accept what you're saying.";
            break;
          case "shift":
            dialogue = "Wait... let me think about this for a second.";
            break;
          case "reflection":
            dialogue = "I'm starting to see your point now.";
            break;
          case "conclusion":
            dialogue = "I think you're right. I needed to hear this.";
            break;
        }

        // Add a blank line before the new block
        lines.splice(insertIndex + offset, 0, "");
        offset++;

        // Add the speaker line
        lines.splice(
          insertIndex + offset,
          0,
          `🗣 ${resistantCharacter} (${emotion}):`
        );
        offset++;

        // Add the dialogue line
        lines.splice(insertIndex + offset, 0, dialogue);
        offset++;
      });
    }

    return lines.join("\n");
  }

  // Ensure stages are in the right order
  const idealOrder = [
    "early",
    "conflict1",
    "conflict2",
    "shift",
    "reflection",
    "conclusion",
  ];
  const currentOrder = emotionalProgression.map((prog) => prog.stage);

  // Check if the order is correct
  let inCorrectOrder = true;
  let lastFoundIndex = -1;

  for (const stage of currentOrder) {
    const idealIndex = idealOrder.indexOf(stage);
    if (idealIndex === -1) continue; // Skip stages not in the ideal order

    if (idealIndex < lastFoundIndex) {
      inCorrectOrder = false;
      break;
    }

    lastFoundIndex = idealIndex;
  }

  if (!inCorrectOrder) {
    // Fix the order by rearranging blocks
    // This is complex, so we'll just reorder the emotions instead of moving blocks
    const orderedEmotions = [];

    // Select one emotion for each stage in order
    idealOrder.forEach((stage) => {
      if (emotionalStages[stage]) {
        orderedEmotions.push({
          stage,
          emotion:
            emotionalStages[stage][
              Math.floor(Math.random() * emotionalStages[stage].length)
            ],
        });
      }
    });

    // Apply ordered emotions to resistant character blocks
    const resistantBlocksToUpdate = Math.min(
      resistantCharacterBlocks.length,
      orderedEmotions.length
    );

    for (let i = 0; i < resistantBlocksToUpdate; i++) {
      const block = resistantCharacterBlocks[i];
      const emotionData = orderedEmotions[i];

      // Update the emotion in the line
      const updatedSpeakerLine = block.speakerLine.replace(
        /\([^)]+\)/,
        `(${emotionData.emotion})`
      );

      lines[block.index] = updatedSpeakerLine;
    }
  }

  return lines.join("\n");
}

/**
 * Ensures the ending of the script is powerful and builds to a snap
 * @param {string} script - The original script
 * @returns {string} - The script with a powerful ending
 */
function ensurePowerfulEnding(script) {
  // Split into lines
  const lines = script.split("\n");
  if (lines.length < 6) {
    return script; // Too short to fix
  }

  // Powerful words/phrases that signal a strong ending
  const powerfulWords = [
    "never",
    "always",
    "real",
    "truth",
    "damn",
    "weak",
    "strong",
    "pathetic",
    "finish",
    "finally",
    "change",
    "decide",
    "choice",
    "face",
    "world",
    "respect",
    "earn",
    "deserve",
    "fear",
    "power",
    "control",
    "fake",
    "excuses",
    "truth",
    "reality",
    "pain",
    "strength",
  ];

  // First, identify all character blocks (speaker line + dialogue lines)
  const characterBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this is a speaker line
    if (line.includes("🗣") && line.includes(":")) {
      // If we have a current block, finish it
      if (currentBlock) {
        characterBlocks.push(currentBlock);
      }

      // Extract character and emotion
      const colonIndex = line.indexOf(":");
      const speakerPart = line.substring(0, colonIndex).trim();
      const emotionMatch = speakerPart.match(/\(([^)]+)\)/);
      const character = speakerPart
        .replace(/🗣\s+/, "")
        .replace(/\s*\([^)]+\)/, "")
        .trim();
      const emotion = emotionMatch ? emotionMatch[1].trim() : "neutral";

      currentBlock = {
        speakerLine: line,
        speakerIndex: i,
        character: character,
        emotion: emotion,
        dialogueLines: [],
        dialogueIndices: [],
      };
    }
    // Otherwise this is dialogue or a stage direction
    else if (currentBlock && !line.startsWith("(")) {
      currentBlock.dialogueLines.push(line);
      currentBlock.dialogueIndices.push(i);
    }
  }

  // Add the final block if there is one
  if (currentBlock && currentBlock.dialogueLines.length > 0) {
    characterBlocks.push(currentBlock);
  }

  // If we don't have enough blocks, return unchanged
  if (characterBlocks.length < 2) {
    return script;
  }

  // Get the last character block
  const lastBlock = characterBlocks[characterBlocks.length - 1];

  // Check if the last dialogue line is already powerful
  const lastDialogue =
    lastBlock.dialogueLines[lastBlock.dialogueLines.length - 1];
  const lastDialogueIndex =
    lastBlock.dialogueIndices[lastBlock.dialogueIndices.length - 1];

  const hasPowerfulWord = powerfulWords.some((word) =>
    lastDialogue.toLowerCase().includes(word)
  );
  const isShort = lastDialogue.split(" ").length <= 10;
  const endsWithPunctuation = /[!.]$/.test(lastDialogue);
  const hasStrongEmotion = [
    "firm",
    "cold",
    "final",
    "stern",
    "resolute",
    "challenging",
  ].some((emotion) => lastBlock.emotion.toLowerCase().includes(emotion));

  // If the last line is already good, we're done
  if (hasPowerfulWord && isShort && endsWithPunctuation && hasStrongEmotion) {
    return script;
  }

  // Check if we have a better line among the other blocks
  let bestBlockIndex = -1;
  let bestDialogueIndex = -1;
  let bestScore = -1;

  // Score each block's final dialogue line as a potential ending
  for (let i = 0; i < characterBlocks.length - 1; i++) {
    const block = characterBlocks[i];
    if (block.dialogueLines.length === 0) continue;

    const dialogue = block.dialogueLines[block.dialogueLines.length - 1];
    const emotion = block.emotion.toLowerCase();

    let score = 0;
    if (powerfulWords.some((word) => dialogue.toLowerCase().includes(word)))
      score += 2;
    if (dialogue.split(" ").length <= 10) score += 1;
    if (/[!.]$/.test(dialogue)) score += 1;
    if (
      ["firm", "cold", "final", "stern", "resolute", "challenging"].some((e) =>
        emotion.includes(e)
      )
    )
      score += 1;

    // Prefer lines that have an exclamation or period at the end
    if (dialogue.endsWith("!")) score += 1;
    if (dialogue.endsWith(".")) score += 0.5;

    // Prefer shorter, punchier lines
    if (dialogue.split(" ").length <= 6) score += 1.5;

    if (score > bestScore) {
      bestBlockIndex = i;
      bestDialogueIndex = block.dialogueIndices[block.dialogueLines.length - 1];
      bestScore = score;
    }
  }

  // If we found a better ending line, swap it with the last dialogue line
  if (bestBlockIndex >= 0 && bestScore >= 3) {
    const bestBlock = characterBlocks[bestBlockIndex];
    const bestDialogue =
      bestBlock.dialogueLines[bestBlock.dialogueLines.length - 1];

    // Swap the lines
    lines[lastDialogueIndex] = bestDialogue;
    lines[bestDialogueIndex] = lastDialogue;

    return lines.join("\n");
  }

  // If we didn't find a better line, enhance the current ending
  let enhancedDialogue = lastDialogue;
  let enhancedEmotion = lastBlock.emotion;

  // Make sure it's not too long
  if (enhancedDialogue.split(" ").length > 8) {
    const words = enhancedDialogue.split(" ");
    // Try to find a good breaking point - favor after punctuation
    let cutPoint = words.findIndex(
      (word, i) => i >= 3 && i <= 6 && word.includes(",")
    );
    if (cutPoint === -1) cutPoint = Math.min(6, words.length - 1);
    enhancedDialogue = words.slice(0, cutPoint + 1).join(" ");

    // Make sure it ends with proper punctuation
    if (!/[.!?]$/.test(enhancedDialogue)) {
      enhancedDialogue += ".";
    }
  }

  // Add a powerful word if missing
  if (
    !powerfulWords.some((word) => enhancedDialogue.toLowerCase().includes(word))
  ) {
    // Look for opportunity to insert a powerful word that fits contextually
    if (enhancedDialogue.toLowerCase().includes("you")) {
      // Personal statement - add a judgment word
      const judgmentWords = [
        "never",
        "always",
        "finally",
        "really",
        "actually",
        "truly",
      ];
      const selectedWord =
        judgmentWords[Math.floor(Math.random() * judgmentWords.length)];

      // Insert after "you" or at beginning
      if (enhancedDialogue.toLowerCase().startsWith("you")) {
        enhancedDialogue = enhancedDialogue.replace(
          /^you\b/i,
          `You ${selectedWord}`
        );
      } else {
        enhancedDialogue = `${
          selectedWord.charAt(0).toUpperCase() + selectedWord.slice(1)
        } ${enhancedDialogue}`;
      }
    } else {
      // General statement - add a powerful word at beginning or end
      const powerWords = [
        "Truth",
        "Reality",
        "Fact",
        "End of story",
        "Final answer",
        "Bottom line",
      ];
      const selectedWord =
        powerWords[Math.floor(Math.random() * powerWords.length)];

      // Add at beginning or convert to a statement
      if (Math.random() > 0.5 && !enhancedDialogue.includes("?")) {
        enhancedDialogue = `${selectedWord}: ${enhancedDialogue}`;
      } else {
        enhancedDialogue = `${enhancedDialogue} That's the ${selectedWord.toLowerCase()}.`;
      }
    }
  }

  // Ensure proper ending punctuation with emphasis
  if (!enhancedDialogue.endsWith("!") && !enhancedDialogue.endsWith(".")) {
    enhancedDialogue += Math.random() > 0.3 ? "!" : ".";
  } else if (enhancedDialogue.endsWith(".") && Math.random() > 0.7) {
    // Sometimes convert period to exclamation for emphasis
    enhancedDialogue = enhancedDialogue.slice(0, -1) + "!";
  }

  // Update emotion to be more impactful for the final line
  const strongEmotions = ["firm", "cold", "final", "resolute", "challenging"];
  if (!strongEmotions.some((e) => enhancedEmotion.toLowerCase().includes(e))) {
    enhancedEmotion =
      strongEmotions[Math.floor(Math.random() * strongEmotions.length)];
  }

  // Update the speaker line with the new emotion
  const updatedSpeakerLine = lastBlock.speakerLine.replace(
    /\(([^)]+)\)/,
    `(${enhancedEmotion})`
  );

  // Apply the changes
  lines[lastBlock.speakerIndex] = updatedSpeakerLine;
  lines[lastDialogueIndex] = enhancedDialogue;

  return lines.join("\n");
}

/**
 * Applies a clarity filter to each line of dialogue
 * Checks if the line would make someone pause and re-read it out of confusion
 * @param {string} script - The original script
 * @returns {string} - The script with clearer dialogue
 */
function applyClarityFilter(script) {
  // Split into lines
  const lines = script.split("\n");

  const confusingPatterns = [
    // Overly complex sentences
    /(?:[^,.!?;:]{30,}[,;:]){3,}/,

    // Mixed metaphors
    /(?:road|path|journey).*(?:book|page|story)/i,
    /(?:build|construct).*(?:grow|plant|seed)/i,

    // Unclear referents
    /\b(?:this|that|it|they)\b.*\b(?:this|that|it|they)\b.*\b(?:this|that|it|they)\b/i,

    // Too many subordinate clauses
    /(?:because|since|as|when|if|although|though|while|unless|until|after|before){3,}/i,

    // Contradictory statements
    /(?:always.*never|never.*always|everything.*nothing|nothing.*everything)/i,

    // Too much abstraction
    /(?:essence|conceptual|fundamental|underlying|inherent|intrinsic|quintessential)/i,
  ];

  // Process each line for clarity
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Only check dialogue lines
    if (line.includes(":") && line.includes('"')) {
      const dialogueMatch = line.match(/:.*"([^"]+)"/);
      if (dialogueMatch) {
        const dialogue = dialogueMatch[1];

        // Check if the line matches any confusing patterns
        const isConfusing = confusingPatterns.some((pattern) =>
          pattern.test(dialogue)
        );

        if (isConfusing) {
          // Simplify the dialogue - split into shorter sentences
          let simplified = dialogue;

          // Replace complex connecting words
          simplified = simplified.replace(
            /\b(consequently|subsequently|furthermore|nevertheless|notwithstanding)\b/gi,
            (match) => {
              const replacements = {
                consequently: "so",
                subsequently: "then",
                furthermore: "also",
                nevertheless: "still",
                notwithstanding: "still",
              };
              return replacements[match.toLowerCase()] || match;
            }
          );

          // Split very long sentences
          if (simplified.length > 60 && !simplified.includes(".")) {
            const words = simplified.split(" ");
            const midpoint = Math.floor(words.length / 2);
            words.splice(midpoint, 0, ".");
            simplified = words.join(" ");
          }

          // Replace the original dialogue with the simplified version
          lines[i] = line.replace(dialogueMatch[1], simplified);
        }
      }
    }
  }

  return lines.join("\n");
}

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
