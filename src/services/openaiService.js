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
 * Generate a cinematic script from philosophical ideas
 * @param {Object} scriptData - The data for script generation
 * @returns {Promise<{script: string, musicRecommendation: string}>} - The generated script and music recommendation
 */
const generateScript = async (scriptData) => {
  try {
    console.log("Generating script with data:", scriptData);
    const systemPrompt = buildScriptSystemPrompt();
    const userPrompt = buildScriptUserPrompt(scriptData);

    // Extract the resistance level from scriptData
    const resistanceLevel = scriptData.resistanceLevel || "Medium";

    // Extract the emotion ending from scriptData
    const emotionEnding = scriptData.emotionEnding || "Impact (Mic drop)";

    console.log("Sending request to OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response from OpenAI");
    }

    console.log("Parsing response...");
    const { script, musicRecommendation } = parseScriptResponse(
      response.choices[0].message.content
    );

    // Apply post-processing to clean up and enhance the script
    console.log(
      `Post-processing script with resistance level: ${resistanceLevel}...`
    );
    const processedScript = postProcessScript(
      script,
      resistanceLevel,
      emotionEnding
    );

    console.log("Script generation complete!");
    return {
      script: processedScript,
      musicRecommendation,
    };
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error(`Failed to generate script: ${error.message}`);
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

## ❌ BLOCK THESE BAD HABITS
The LLM must NEVER reuse cliché emotional realization lines like:
- "I never looked at it like that."
- "You're right."
- "Wow, I didn't think of that."
- "I guess I was wrong."

These are robotic, overused, and ruin the emotional impact of the scene. They feel fake and formulaic. Real people don't talk like this.

## ✅ INSTEAD — CREATE UNIQUE REALIZATION MOMENTS ("CRACK LINES")
Every script must contain a custom-written breakthrough line (the "Crack Line") that:
- Feels like something a real person would say when their ego breaks or their walls come down
- Responds directly to what was just said (context-driven, not generic)
- Carries emotional weight — surrender, shame, regret, acceptance, or raw clarity
- Sounds unscripted — like they didn't mean to say it, it just slipped out
- Uses simple, natural language — like two friends or brothers talking

A "Crack Line" is:
- The moment their defense breaks
- 1–2 sentences max
- Personal, vulnerable, unfiltered
- Something you'd say when you stop pretending and just admit it

Examples (not to reuse, just for tone):
- "Maybe I don't hate the gym... I just hate feeling behind."
- "I guess I've been blaming everything but myself."

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

## 🔑 SUMMARY OF FORMATTING RULES:
- Use plain English
- Keep tone real, raw, conversational
- No corporate voice. No script-feeling dialogue
- Speak like friend to friend or bro to bro — not like actors

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
13. ✅ REALIZATION CHECK: Emotional breakthrough uses unique "Crack Line", not cliché phrases

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
    resistanceLevel = "Medium", // Default to medium if not provided
    openingStyle = "Start with a challenge", // Default opening style
    messengerPersonality = "Calm and persuasive", // Default messenger personality
    resistorPersonality = "Defensive and angry", // Default resistor personality
    character1Personality, // For 3-character scripts: Character A
    character2Personality, // For 3-character scripts: Character B
    character3Personality, // For 3-character scripts: Character C
    emotionEnding = "Impact (Mic drop)", // Default emotion ending
    pacing = "Medium (60-90 sec)", // Default pacing
    finalMicDrop = "", // Optional final line
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
• No narration, no exposition - just pure, emotionally charged truth-telling
• CHARACTER PERSONALITY: ${character1Personality || messengerPersonality}`;
  } else if (numCharacters === 2) {
    prompt += `\n• Two character dialogue: ${charactersList.join(" and ")}
• These characters should represent opposing mindsets or values  
• They must clash - the tension between them is what reveals the truth
• One character should embody truth or growth, the other represents ego, ignorance, or resistance
• TRUTH-TELLER PERSONALITY: ${messengerPersonality}
• RESISTOR PERSONALITY: ${resistorPersonality}
• RESISTANCE LEVEL: ${resistanceLevel} - ${getResistanceLevelDescription(
      resistanceLevel
    )}`;
  } else {
    prompt += `\n• Three-character format: ${charactersList.join(", ")}
• Dynamic should involve tension and opposing viewpoints
• Create distinct voices for each character based on their personalities
• CHARACTER A (Main Speaker) PERSONALITY: ${
      character1Personality || "Calm and persuasive"
    }
• CHARACTER B (Support/Contrast) PERSONALITY: ${
      character2Personality || "Mocking and sarcastic"
    }
• CHARACTER C (Observer/Wildcard) PERSONALITY: ${
      character3Personality || "Calm and reflective"
    }
• RESISTANCE LEVEL: ${resistanceLevel} - ${getResistanceLevelDescription(
      resistanceLevel
    )}`;
  }

  // Tone and themes
  prompt += `\n\nTONE: ${tone}\n`;
  prompt += `THEMES: ${themes.join(", ")}\n`;
  prompt += `EMOTIONAL ARC: ${emotionalArc}\n`;
  prompt += `OPENING STYLE: ${openingStyle}\n`;
  prompt += `SCRIPT LENGTH: ${pacing}\n`;
  prompt += `EMOTIONAL ENDING: ${emotionEnding}\n`;

  // Optional directives
  if (hookDirective && hookDirective.trim()) {
    prompt += `\nHOOK DIRECTIVE: ${hookDirective}\n`;
  }

  // Final mic drop line
  if (finalMicDrop && finalMicDrop.trim()) {
    prompt += `\nFINAL MIC DROP LINE: Use this exact line or a close variation: "${finalMicDrop}"\n`;
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

  // Special resistance level instructions
  if (numCharacters > 1) {
    prompt += `\n\nRESISTANCE LEVEL INSTRUCTIONS:
${getResistanceLevelInstructions(resistanceLevel)}`;

    // Opening style instructions
    prompt += `\n\nOPENING STYLE INSTRUCTIONS:
${getOpeningStyleInstructions(openingStyle)}`;

    // Emotion ending instructions
    prompt += `\n\nEMOTIONAL ENDING INSTRUCTIONS:
${getEmotionEndingInstructions(emotionEnding)}`;

    // Pacing instructions
    prompt += `\n\nPACING INSTRUCTIONS:
${getPacingInstructions(pacing)}`;

    // Add specific instructions for 3-character scenes
    if (numCharacters === 3) {
      prompt += `\n\nTHREE-CHARACTER DYNAMIC INSTRUCTIONS:
• Character A (${
        charactersList[0] || "Main Speaker"
      }) should drive the philosophical message
• Character B (${
        charactersList[1] || "Support/Contrast"
      }) should provide resistance or alternative perspectives
• Character C (${charactersList[2] || "Observer/Wildcard"}) should either:
  - Act as an audience proxy asking clarifying questions
  - Provide comic relief or unexpected insights
  - Start neutral and show the most dramatic shift in perspective
• Ensure all three characters have distinct voices matching their personalities
• Not all characters need equal dialogue - focus on the dynamic that best serves the philosophy
• The script should still have a clear emotional progression and conflict`;
    }
  }

  // Music recommendation
  if (musicRecommendation) {
    prompt += `\n\nPlease include a music recommendation at the end that would perfectly match the emotional tone of this script. Format as:
🎵 Suggested Music: "[Track Name]" – [Artist]
Reason: [Brief explanation of why this music matches the script's emotional tone]`;
  }

  return prompt;
};

/**
 * Get a description for the resistance level
 * @param {string} level - The resistance level (Low, Medium, or High)
 * @returns {string} - Description of the resistance level
 */
const getResistanceLevelDescription = (level) => {
  switch (level) {
    case "Low":
      return "Character is calm and open-minded, accepts logic quickly";
    case "High":
      return "Character is sarcastic, dismissive, or emotionally closed, resists hard until the very end";
    case "Medium":
    default:
      return "Character is defensive but not closed-minded, pushes back, gradually opens up";
  }
};

/**
 * Get detailed instructions for the given resistance level
 * @param {string} level - The resistance level (Low, Medium, or High)
 * @returns {string} - Detailed instructions for the resistance level
 */
const getResistanceLevelInstructions = (level) => {
  switch (level) {
    case "Low":
      return `• The resistant character should be skeptical but open to new ideas
• They should ask clarifying questions rather than attacking
• Their emotional journey should be gradual and smooth
• They should show signs of understanding by the middle of the script
• The focus should be on the philosophical message more than the conflict
• Their realization should feel earned but not dramatically difficult`;

    case "High":
      return `• The resistant character should be highly defensive, dismissive, or even mocking
• They should use sarcasm, interruptions, and emotional deflection
• They should actively resist logic and evidence for most of the script
• Their emotional wall should only crack after significant pressure
• Their resistance should feel genuine and psychologically believable
• The breakthrough moment should be powerful and surprising
• They should have at least 3-4 strong objections before showing any signs of change
• Their final acceptance should be reluctant but profound`;

    case "Medium":
    default:
      return `• The resistant character should be defensive but not unreasonable
• They should challenge ideas but remain open to discussion
• Their emotional journey should have clear stages of resistance and acceptance
• They should begin showing signs of understanding after 2-3 exchanges
• Their objections should represent common real-world resistance to the philosophy
• Their realization should feel earned through the dialogue`;
  }
};

/**
 * Get instructions for the opening style
 * @param {string} style - The opening style
 * @returns {string} - Instructions for the opening style
 */
const getOpeningStyleInstructions = (style) => {
  switch (style) {
    case "Start with humor":
      return `• Begin with a light-hearted or sarcastic comment that sets up the philosophical tension
• Use humor that contrasts with the seriousness of the topic
• The humor should feel natural, not forced or cheesy
• Transition quickly from humor to the core philosophical challenge`;

    case "Start with confusion":
      return `• Begin with one character expressing genuine confusion about a belief or behavior
• Use questions that reveal misunderstanding or cognitive dissonance
• The confusion should feel authentic, not performative
• This confusion becomes the gateway to the philosophical exploration`;

    case "Start mid-fight":
      return `• Drop immediately into an ongoing heated disagreement
• No setup or context-setting - start with tension already high
• Use emotionally charged language from the first line
• Make it clear the argument has been going on before the scene started`;

    case "Start with a question":
      return `• Begin with a direct, thought-provoking question from one character to another
• Make the question challenging, uncomfortable, or paradigm-shifting
• The question should immediately create tension or reflection
• The response to this question drives the philosophical exploration`;

    case "Start with a provocative statement":
      return `• Begin with a bold, controversial claim that challenges conventional thinking
• Make the statement feel like a gauntlet being thrown down
• The statement should be concise but emotionally impactful
• The other character's reaction to this statement drives the scene forward`;

    case "Start with a challenge":
    default:
      return `• Begin with one character directly challenging the other's beliefs or actions
• Make the challenge direct, pointed, and uncomfortably honest
• Don't waste time with pleasantries - cut straight to the philosophical tension
• The challenge should immediately reveal the core conflict between worldviews`;
  }
};

/**
 * Get instructions for the emotion ending
 * @param {string} ending - The emotion ending
 * @returns {string} - Instructions for the emotion ending
 */
const getEmotionEndingInstructions = (ending) => {
  switch (ending) {
    case "Resolution (Calm, hopeful)":
      return `• End with a sense of mutual understanding and growth
• The final lines should feel peaceful but still profound
• Use softer, more reflective language in the final exchange
• The resistant character should show genuine acceptance
• Leave the audience with a feeling of hope and possibility
• Avoid sharp, aggressive language in the final lines`;

    case "Silence (No final line, just realization)":
      return `• End with a moment of silent realization rather than a verbal conclusion
• After the final truth is delivered, end with a stage direction showing impact
• Use body language or a facial expression to convey the emotional landing
• The power comes from what is not said rather than a quotable line
• Consider using something like "[Long silence as the words sink in]" or "[No response - just a look of dawning understanding]"
• This ending works especially well for profound, life-changing realizations`;

    case "Impact (Mic drop)":
    default:
      return `• End with a powerful, quotable line that lands like a punch
• Make the final statement short, sharp, and immediately memorable
• The line should crystallize the entire philosophical message
• It should feel like the definitive word on the subject - no comeback possible
• This is the line viewers will remember and quote later
• It should feel like dropping the mic - conversation over`;
  }
};

/**
 * Get instructions for the pacing
 * @param {string} pacing - The pacing (Short, Medium, or Long)
 * @returns {string} - Instructions for the pacing
 */
const getPacingInstructions = (pacing) => {
  switch (pacing) {
    case "Short (30 sec)":
      return `• Create a concise script with approximately 4-6 dialogue exchanges total
• Each line should be brief and immediately impactful (5-15 words per line)
• Skip elaborate setups - get to the core philosophical point immediately
• Focus on only ONE central truth or realization
• Eliminate any secondary points or tangential ideas
• Every single word must be essential`;

    case "Long (2-3 min)":
      return `• Create a more developed script with 12-16 dialogue exchanges
• Allow for more nuanced development of ideas (15-30 words per line is acceptable)
• Include 2-3 distinct philosophical points that build on each other
• Develop the emotional arc more gradually with clear stages
• Allow for more back-and-forth resistance before the breakthrough
• Include specific examples or scenarios that illustrate the philosophy
• Still maintain focus and eliminate any unnecessary tangents`;

    case "Medium (60-90 sec)":
    default:
      return `• Create a balanced script with 8-10 dialogue exchanges
• Keep lines focused but allow some development (10-20 words per line)
• Focus on 1-2 central philosophical points
• Create a clear emotional progression with adequate resistance
• Every line should advance either the philosophy or the emotional arc
• Eliminate any repetition or unnecessary elaboration`;
  }
};

/**
 * Parse the OpenAI response to extract script and music recommendation
 * @param {string} content - The content from the OpenAI response
 * @returns {Object} - The parsed script and music recommendation
 */
const parseScriptResponse = (content) => {
  console.log("Parsing script response...");

  if (!content) {
    console.error("Empty response content");
    return { script: "", musicRecommendation: "" };
  }

  // Look for music recommendation section
  let musicRecommendation = "";
  const musicMatch = content.match(
    /MUSIC RECOMMENDATION:?([\s\S]*?)(?:$|SCRIPT:)/i
  );
  if (musicMatch && musicMatch[1]) {
    musicRecommendation = musicMatch[1].trim();
  }

  // Extract the script content
  let script = content;

  // If there's a SCRIPT: marker, extract everything after it
  const scriptMatch = content.match(
    /SCRIPT:?([\s\S]*?)(?:$|MUSIC RECOMMENDATION:)/i
  );
  if (scriptMatch && scriptMatch[1]) {
    script = scriptMatch[1].trim();
  } else if (musicRecommendation) {
    // If we found a music recommendation but no SCRIPT marker,
    // remove the music recommendation part from the script
    script = content.replace(/MUSIC RECOMMENDATION:?([\s\S]*?)$/i, "").trim();
  }

  // Clean up markup in the script
  script = script.replace(/```/g, "");
  script = script.replace(/^```[\w]*$/gm, "");

  return { script, musicRecommendation };
};

/**
 * Performs post-processing on the generated script to fix common issues
 * @param {string} script - The raw script from OpenAI
 * @param {string} resistanceLevel - The resistance level (Low, Medium, High)
 * @param {string} emotionEnding - The emotion ending style
 * @returns {string} - The cleaned-up script
 */
const postProcessScript = (
  script,
  resistanceLevel = "Medium",
  emotionEnding = "Impact (Mic drop)"
) => {
  if (!script) return script;
  console.log("Post-processing script with resistance level:", resistanceLevel);

  // Step 1: Remove corrupt emojis and other control characters
  script = script.replace(/[\uFFFD\u0000-\u001F\u2028\u2029]/g, "");

  // Step 2: Fix spacing around punctuation
  script = script.replace(/\s+([.,;:!?])/g, "$1"); // No spaces before punctuation
  script = script.replace(/([.,;:!?])(?!\s|$)/g, "$1 "); // Space after punctuation if not already there

  // Step 3: Fix apostrophes in contractions
  script = script.replace(/(\w)\s?['']\s?(\w)/g, "$1'$2"); // Fix don ' t -> don't

  // Step 4: Standardize character formatting
  const characterLines = script.match(/^[^🗣]*🗣[^:]*:.*$/gm) || [];
  characterLines.forEach((line) => {
    // If character line doesn't have an emoji at the start, add it
    if (!line.trim().startsWith("🗣")) {
      const fixedLine = `🗣 ${line.trim()}`;
      script = script.replace(line, fixedLine);
    }

    // If character doesn't have emotion in parentheses, add (neutral)
    if (!line.includes("(") || !line.includes(")")) {
      const nameEndPos = line.indexOf(":");
      if (nameEndPos > 0) {
        const beforeColon = line.substring(0, nameEndPos).trim();
        if (!beforeColon.includes("(")) {
          const withEmotion =
            beforeColon + " (neutral)" + line.substring(nameEndPos);
          script = script.replace(line, withEmotion);
        }
      }
    }
  });

  // Step 5: Fix dialogue quotation issues
  const dialogueLines = script.match(/^[^🗣:]*"[^"]*"[^"]*$/gm) || [];
  dialogueLines.forEach((line) => {
    // If dialogue doesn't end with punctuation inside quotes
    let fixedLine = line;
    if (/"[^.,!?]"/.test(line)) {
      fixedLine = line.replace(/"([^.,!?]*)"/, '"$1."');
      script = script.replace(line, fixedLine);
    }
  });

  // Step 6: Replace invalid emotional states with valid ones
  const invalidEmotions = [
    "ponders",
    "musing",
    "wonders",
    "thinks",
    "questions",
    "uncertain",
  ];

  const validEmotions = [
    "thoughtful",
    "curious",
    "reflective",
    "contemplative",
    "pondering",
    "wondering",
  ];

  invalidEmotions.forEach((emotion, index) => {
    const replacement = validEmotions[index % validEmotions.length];
    const regex = new RegExp(`\\(\\s*${emotion}\\s*\\)`, "gi");
    script = script.replace(regex, `(${replacement})`);
  });

  // Step 7: Fix malformed stage directions
  script = script.replace(/\[\s*[^a-zA-Z]*\s*]/g, ""); // Remove stage directions with no alphabetic characters

  // Step 8: Fix common unrealistic dialogue patterns
  script = script.replace(/"I am ([a-zA-Z]+)"/g, '"I\'m $1"'); // Replace "I am" with "I'm"
  script = script.replace(/"You are ([a-zA-Z]+)"/g, '"You\'re $1"'); // Replace "You are" with "You're"
  script = script.replace(/"That is ([a-zA-Z]+)"/g, '"That\'s $1"'); // Replace "That is" with "That's"

  // Step 9: Ensure emotional progression in dialogue based on resistance level
  script = ensureEmotionalProgression(script, resistanceLevel);

  // Step 10: Ensure the script ends with a powerful line based on the emotion ending choice
  script = ensurePowerfulEnding(script, emotionEnding);

  // Step 11: Apply final clarity filter
  script = script.replace(/\b(um|uh|er|like,)\b\s*/gi, ""); // Remove filler words

  // Step 12: Final spacing cleanup
  script = script.replace(/\n{3,}/g, "\n\n"); // Replace multiple line breaks with just two
  script = script.replace(/[ \t]+/g, " "); // Replace multiple spaces with a single space

  return script;
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

/**
 * Ensures the script ends with a powerful, decisive line based on the emotion ending choice
 * @param {string} script - The script to process
 * @param {string} emotionEnding - The emotion ending style
 * @returns {string} - The processed script with a proper ending
 */
const ensurePowerfulEnding = (script, emotionEnding = "Impact (Mic drop)") => {
  // Check if we have enough content to work with
  if (!script || script.trim().length < 100) return script;

  // Split into lines and get the last few lines
  const lines = script.split("\n");
  if (lines.length < 3) return script;

  // Get the last few non-empty content lines
  const lastLines = lines.filter((line) => line.trim().length > 0).slice(-3);

  // Check if the final line is a stage direction
  const lastLineIsStageDirection = lastLines[lastLines.length - 1]
    .trim()
    .startsWith("[");

  // For "Silence" ending, make sure we end with a stage direction
  if (emotionEnding === "Silence (No final line, just realization)") {
    const impactfulSilenceDirections = [
      "[No response - just a look of dawning understanding]",
      "[Long silence as the words sink in]",
      "[Their eyes widen with realization]",
      "[They fall silent, unable to respond]",
      "[A moment of profound silence follows]",
    ];

    // If we already end with a stage direction, replace it; otherwise add one
    if (lastLineIsStageDirection) {
      lines[lines.length - 1] =
        impactfulSilenceDirections[
          Math.floor(Math.random() * impactfulSilenceDirections.length)
        ];
    } else {
      lines.push("");
      lines.push(
        impactfulSilenceDirections[
          Math.floor(Math.random() * impactfulSilenceDirections.length)
        ]
      );
    }

    return lines.join("\n");
  }

  // For other ending types, continue with normal processing
  // Check for weak endings
  const weakEndingPatterns = [
    /maybe/i,
    /perhaps/i,
    /i guess/i,
    /i think/i,
    /we'll see/i,
    /who knows/i,
    /let's try/i,
    /hopefully/i,
    /we can/i,
    /might be/i,
    /could be/i,
    /someday/i,
    /one day/i,
    /sometime/i,
    /eventually/i,
    /possibly/i,
  ];

  // Check for vague metaphors that don't land well
  const vagueMetaphorPatterns = [
    /like a.{1,20}in the.{1,20}/i,
    /as if.{1,20}were.{1,20}/i,
    /similar to/i,
    /in the same way/i,
  ];

  // Find the last dialogue line
  let lastDialogueLine = "";
  let lastDialogueLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.includes("🗣") && line.includes(":") && i < lines.length - 1) {
      // This is a character line, the next line should be dialogue
      lastDialogueLine = lines[i + 1].trim();
      lastDialogueLineIndex = i + 1;
      break;
    }
  }

  // If we didn't find dialogue or it's not near the end, return unchanged
  if (
    lastDialogueLineIndex === -1 ||
    lines.length - lastDialogueLineIndex > 5
  ) {
    return script;
  }

  // Check if the ending is weak
  let needsStrongerEnding = false;

  // Check for weak language in the last dialogue
  for (const pattern of weakEndingPatterns) {
    if (pattern.test(lastDialogueLine)) {
      needsStrongerEnding = true;
      break;
    }
  }

  // Check for vague metaphors
  if (!needsStrongerEnding) {
    for (const pattern of vagueMetaphorPatterns) {
      if (pattern.test(lastDialogueLine)) {
        needsStrongerEnding = true;
        break;
      }
    }
  }

  // Check if ending lacks impact (too short, no punctuation, etc.)
  if (!needsStrongerEnding) {
    const stripped = lastDialogueLine.replace(/["']/g, "").trim();
    if (
      stripped.length < 15 ||
      !/[.!?]$/.test(stripped) ||
      /\.\.\.$/.test(stripped)
    ) {
      needsStrongerEnding = true;
    }
  }

  // If the ending is fine, return unchanged
  if (!needsStrongerEnding) {
    return script;
  }

  // Get character information to create a stronger ending
  let characterName = "";
  let characterEmotion = "resolved";

  const characterMatch = lines[lastDialogueLineIndex - 1].match(
    /🗣\s+([^(]+)\s*\(([^)]+)\):/
  );
  if (characterMatch) {
    characterName = characterMatch[1].trim();
    characterEmotion = characterMatch[2].trim();
  }

  // Create stronger ending options based on the emotion ending choice and character's emotion
  let strongEndingOptions = {};

  if (emotionEnding === "Resolution (Calm, hopeful)") {
    // More reflective, gentle endings
    strongEndingOptions = {
      denial: [
        "Maybe there's more to this than I've been willing to see.",
        "I need to reconsider some things I've been holding onto too tightly.",
        "This isn't easy to hear, but I think I needed to hear it.",
      ],
      acceptance: [
        "Sometimes the path forward only becomes clear when we stop fighting it.",
        "There's a certain peace in finally understanding this.",
        "I think we both learned something important today.",
      ],
      transformation: [
        "I feel like I'm seeing things with new eyes now.",
        "This changes my perspective in ways I didn't expect.",
        "I'm grateful for this conversation, even though it wasn't easy.",
      ],
      default: [
        "The truth has a way of finding us when we're ready to hear it.",
        "Some lessons take time to learn, but they're worth the journey.",
        "I think I understand now, and that's a good place to start.",
      ],
    };
  } else {
    // Default to impact (mic drop) endings
    strongEndingOptions = {
      // For emotions showing resistance or doubt
      denial: [
        "That's where you're wrong. This isn't about me—it's about the truth we're all afraid to face.",
        "You don't understand. You can't understand. And that's exactly the problem.",
        "Keep telling yourself that. I'll be here when you're ready to face reality.",
      ],
      // For emotions showing acceptance or resolve
      acceptance: [
        "This moment—right now—is all that matters. Everything else was just preparation.",
        "The answer was in front of me the entire time. I just needed to stop running from it.",
        "Some truths can't be explained. They can only be lived.",
      ],
      // For emotions showing transformation
      transformation: [
        "I'm not who I was yesterday. And tomorrow, I won't be who I am today.",
        "It ends here. Not because I'm giving up, but because I'm finally seeing clearly.",
        "Everything changes when you realize you've been asking the wrong question all along.",
      ],
      // Default powerful endings
      default: [
        "That's the difference between us. You see what is. I see what could be.",
        "The hardest truth isn't what we've lost. It's what we never had the courage to find.",
        "Sometimes the only way forward is to burn the map you've been following.",
      ],
    };
  }

  // Determine which category to use
  let endingCategory = "default";
  const emotionLower = characterEmotion.toLowerCase();

  if (/denial|angry|resistant|defensive|stubborn|defiant/.test(emotionLower)) {
    endingCategory = "denial";
  } else if (/accept|resolved|calm|peaceful|understanding/.test(emotionLower)) {
    endingCategory = "acceptance";
  } else if (
    /transform|changing|evolving|awakening|realizing/.test(emotionLower)
  ) {
    endingCategory = "transformation";
  }

  // Select a random strong ending from the appropriate category
  const options = strongEndingOptions[endingCategory];
  const strongEnding = options[Math.floor(Math.random() * options.length)];

  // Replace the last dialogue line with the stronger ending
  lines[lastDialogueLineIndex] = `"${strongEnding}"`;

  // If the script ended with a stage direction, make sure it reflects the impact
  if (lastLineIsStageDirection) {
    const impactfulDirections = [
      "[The words hang in the air with undeniable weight]",
      "[A moment of profound silence follows]",
      "[Their eyes meet in silent understanding]",
    ];

    const randomDirection =
      impactfulDirections[
        Math.floor(Math.random() * impactfulDirections.length)
      ];

    // Replace or add the final stage direction
    if (lines[lines.length - 1].trim().startsWith("[")) {
      lines[lines.length - 1] = randomDirection;
    } else {
      lines.push("");
      lines.push(randomDirection);
    }
  }

  return lines.join("\n");
};

/**
 * Ensures that the script has proper emotional progression based on the resistance level
 * @param {string} script - The script to process
 * @param {string} resistanceLevel - The resistance level (Low, Medium, High)
 * @returns {string} - The processed script with proper emotional progression
 */
const ensureEmotionalProgression = (script, resistanceLevel = "Medium") => {
  // Check if there are multiple characters in the script
  const characterMatches = script.match(/🗣\s+([^(]+)\s*\([^)]+\):/g);
  if (!characterMatches || characterMatches.length < 2) {
    return script; // Not enough characters for progression
  }

  // Split script into lines and ensure there are enough lines
  const lines = script.split("\n");
  if (lines.length < 6) {
    return script; // Not enough lines for meaningful progression
  }

  // Track character emotions
  const characterEmotions = new Map();
  const characterLines = [];
  const nonCharacterLines = [];

  // Identify character lines and their emotions
  for (let i = 0; i < lines.length; i++) {
    const emotionMatch = lines[i].match(/🗣\s+([^(]+)\s*\(([^)]+)\):/);
    if (emotionMatch) {
      const character = emotionMatch[1].trim();
      const emotion = emotionMatch[2].trim().toLowerCase();

      if (!characterEmotions.has(character)) {
        characterEmotions.set(character, []);
      }

      characterEmotions.get(character).push({
        emotion: emotion,
        lineIndex: i,
        line: lines[i],
      });

      characterLines.push({ index: i, character, emotion, line: lines[i] });
    } else {
      nonCharacterLines.push({ index: i, line: lines[i] });
    }
  }

  // Check if we have at least 2 characters
  if (characterEmotions.size < 2) {
    return script;
  }

  // Find the resistant character (typically has more negative emotions)
  let resistantCharacter = null;
  let wisdomCharacter = null;
  let maxNegativeEmotions = -1;

  for (const [character, emotions] of characterEmotions.entries()) {
    const negativeCount = emotions.filter((e) =>
      [
        "defensive",
        "resistant",
        "angry",
        "frustrated",
        "dismissive",
        "skeptical",
      ].includes(e.emotion)
    ).length;

    if (negativeCount > maxNegativeEmotions) {
      maxNegativeEmotions = negativeCount;
      resistantCharacter = character;
    }
  }

  // The other character is likely the wisdom character
  for (const character of characterEmotions.keys()) {
    if (character !== resistantCharacter) {
      wisdomCharacter = character;
      break;
    }
  }

  if (!resistantCharacter || !wisdomCharacter) {
    return script;
  }

  // Define emotional progression stages based on resistance level
  let emotionalStages = {};

  switch (resistanceLevel) {
    case "Low":
      emotionalStages = {
        early: ["curious", "interested", "attentive", "skeptical"],
        middle: ["questioning", "considering", "thoughtful"],
        shift: ["reflective", "realizing", "understanding"],
        conclusion: ["accepting", "agreeing", "enlightened", "grateful"],
      };
      break;

    case "High":
      emotionalStages = {
        early: ["dismissive", "mocking", "sarcastic", "defensive"],
        resistance1: ["angry", "frustrated", "defiant", "stubborn"],
        resistance2: ["resistant", "argumentative", "challenging", "annoyed"],
        resistance3: ["conflicted", "confused", "unsettled", "uncomfortable"],
        beginning_crack: ["doubtful", "hesitant", "uncertain", "wavering"],
        shift: ["surprised", "stunned", "quiet", "shocked"],
        reluctant_acceptance: [
          "reluctant",
          "resigned",
          "acknowledging",
          "conceding",
        ],
        conclusion: ["changed", "transformed", "awakened", "humbled"],
      };
      break;

    case "Medium":
    default:
      emotionalStages = {
        early: ["skeptical", "defensive", "resistant", "dismissive"],
        conflict1: ["frustrated", "challenging", "questioning", "doubtful"],
        shift: ["considering", "reflective", "thoughtful", "quieter"],
        acceptance: ["understanding", "realizing", "acknowledging"],
        conclusion: ["accepting", "transformed", "enlightened", "resolved"],
      };
      break;
  }

  // Check if resistant character has enough lines to show all stages
  const resistantLines = characterEmotions.get(resistantCharacter);
  const stageCount = Object.keys(emotionalStages).length;

  if (resistantLines.length < stageCount) {
    // Need to add more lines
    const wisdomLines = characterEmotions.get(wisdomCharacter);
    const originalLength = lines.length;

    // For each missing stage, generate a new line
    let lineIndex = Math.min(...resistantLines.map((l) => l.lineIndex));
    for (const [stage, emotions] of Object.entries(emotionalStages)) {
      if (!resistantLines.some((l) => emotions.includes(l.emotion))) {
        // Add a new line for this stage
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const newLine = `🗣 ${resistantCharacter} (${emotion}): "${generateLineForEmotion(
          emotion,
          resistanceLevel
        )}"`;

        // Insert after a wisdom character line
        const insertAfter = wisdomLines.find((l) => l.lineIndex > lineIndex);
        if (insertAfter) {
          lineIndex = insertAfter.lineIndex;
          lines.splice(lineIndex + 1, 0, newLine);
          // Update indices of all lines after this
          for (let i = 0; i < characterLines.length; i++) {
            if (characterLines[i].index > lineIndex) {
              characterLines[i].index++;
            }
          }
          for (let i = 0; i < nonCharacterLines.length; i++) {
            if (nonCharacterLines[i].index > lineIndex) {
              nonCharacterLines[i].index++;
            }
          }
          lineIndex++;
        }
      }
    }

    if (lines.length !== originalLength) {
      return lines.join("\n");
    }
  }

  // Check if all required stages are present
  const presentStages = new Set();
  for (const line of resistantLines) {
    for (const [stage, emotions] of Object.entries(emotionalStages)) {
      if (emotions.includes(line.emotion)) {
        presentStages.add(stage);
        break;
      }
    }
  }

  // Fix missing stages
  if (presentStages.size < Object.keys(emotionalStages).length) {
    const missingStages = Object.keys(emotionalStages).filter(
      (stage) => !presentStages.has(stage)
    );

    // For each missing stage, try to replace an existing line or insert a new one
    for (const stage of missingStages) {
      const emotions = emotionalStages[stage];
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];

      // Try to replace a line that doesn't fit progression
      const replaceable = resistantLines.find(
        (l) => !Object.values(emotionalStages).flat().includes(l.emotion)
      );

      if (replaceable) {
        lines[replaceable.lineIndex] = lines[replaceable.lineIndex].replace(
          /\([^)]+\):/,
          `(${emotion}):`
        );
      } else {
        // Insert a new line after a wisdom character line
        const wisdomLines = characterEmotions.get(wisdomCharacter);
        if (wisdomLines && wisdomLines.length > 0) {
          const lastWisdomLine = wisdomLines[wisdomLines.length - 1];
          const newLine = `🗣 ${resistantCharacter} (${emotion}): "${generateLineForEmotion(
            emotion,
            resistanceLevel
          )}"`;
          lines.splice(lastWisdomLine.lineIndex + 1, 0, newLine);
        }
      }
    }
  }

  // Ensure stage ordering
  const orderedLines = ensureStageOrdering(
    lines,
    resistantCharacter,
    emotionalStages,
    resistanceLevel
  );

  return orderedLines.join("\n");
};

/**
 * Helper function to generate a line based on the emotion and resistance level
 * @param {string} emotion - The emotion to generate a line for
 * @param {string} resistanceLevel - The resistance level
 * @returns {string} - A line of dialogue fitting the emotion and resistance level
 */
function generateLineForEmotion(emotion, resistanceLevel = "Medium") {
  // Define emotion lines based on resistance level
  const lowResistanceLines = {
    curious: "I'm interested in understanding more about that perspective.",
    interested: "That's an interesting way to look at it.",
    attentive: "I'm listening. Tell me more about your thinking here.",
    skeptical: "I see what you're saying, but I'm not fully convinced yet.",
    questioning: "How does that work in practice though?",
    considering: "I'm starting to see your point.",
    thoughtful: "Let me think about that for a moment...",
    reflective: "That's making me reconsider some assumptions.",
    realizing: "I hadn't thought about it that way before.",
    understanding: "I think I understand what you mean now.",
    accepting: "You're right. I can see the truth in what you're saying.",
    agreeing: "I agree with you on that.",
    enlightened: "This is actually changing how I see things.",
    grateful: "Thank you for helping me understand this better.",
  };

  const mediumResistanceLines = {
    skeptical: "I'm not sure if I can agree with that.",
    defensive: "That's not how I see it at all.",
    resistant: "I don't think that's right.",
    dismissive: "That sounds like overthinking to me.",
    frustrated: "You're missing my point completely.",
    challenging: "But how do you explain when that doesn't work?",
    questioning: "Are you sure about that? It doesn't seem right.",
    doubtful: "I have serious doubts about that approach.",
    considering: "Hmm, I hadn't considered it from that angle.",
    reflective: "Maybe there's something to what you're saying...",
    thoughtful: "I need to think about this more.",
    quieter: "...",
    understanding: "I think I see what you mean now.",
    realizing: "Wait, I think I've been looking at this all wrong.",
    acknowledging: "I have to admit, there's truth in what you're saying.",
    accepting: "You're right. I need to change my perspective.",
    transformed: "This changes everything I thought I knew.",
    enlightened: "I feel like I'm seeing clearly for the first time.",
    resolved: "From now on, I'm going to approach this differently.",
  };

  const highResistanceLines = {
    dismissive: "That's complete nonsense.",
    mocking: "Oh, so you're the expert now? Please enlighten me.",
    sarcastic: "Wow, you've got it all figured out, don't you?",
    defensive: "Don't try to tell me how to think about this.",
    angry: "You have no idea what you're talking about!",
    frustrated: "You're not listening to a word I'm saying!",
    defiant: "I completely disagree, and nothing you say will change that.",
    stubborn: "I'm not buying any of this.",
    resistant: "That might work in theory, but not in the real world.",
    argumentative: "That's a ridiculous oversimplification.",
    challenging: "Prove it. Show me one person who actually lives like that.",
    annoyed: "Can we drop this? You're not going to convince me.",
    conflicted:
      "I want to dismiss this, but something you said is sticking with me.",
    confused: "Wait, that doesn't make sense with what I've always believed.",
    unsettled: "I don't like where this conversation is going.",
    uncomfortable: "This is hitting a little too close to home.",
    doubtful: "I'm starting to wonder if I've been wrong...",
    hesitant:
      "I'm not saying you're right, but maybe I'm not seeing the full picture.",
    uncertain: "I don't know what to think anymore.",
    wavering: "My certainty is starting to crack a little.",
    surprised: "I never expected to hear something that makes this much sense.",
    stunned: "I... I don't have a counter-argument for that.",
    quiet: "...",
    shocked: "That hit me harder than I thought it would.",
    reluctant: "Fine. Maybe there's something to what you're saying.",
    resigned: "I guess I can't deny the logic.",
    acknowledging: "Damn it. You might be onto something here.",
    conceding: "Alright, I'll admit it - you have a point.",
    changed: "I can't go back to thinking the way I did before.",
    transformed: "Everything looks different now.",
    awakened: "It's like I've been seeing through a filter until now.",
    humbled: "I was so certain, but I was completely wrong.",
  };

  // Select the appropriate set of lines based on resistance level
  let emotionLines;
  switch (resistanceLevel) {
    case "Low":
      emotionLines = lowResistanceLines;
      break;
    case "High":
      emotionLines = highResistanceLines;
      break;
    case "Medium":
    default:
      emotionLines = mediumResistanceLines;
      break;
  }

  // Return the line for the given emotion, or a default if not found
  return emotionLines[emotion] || "I need to reconsider what I thought I knew.";
}

/**
 * Helper function to ensure emotional stages appear in the right order
 * @param {string[]} lines - The script lines
 * @param {string} resistantCharacter - The name of the resistant character
 * @param {Object} emotionalStages - The emotional stages object
 * @param {string} resistanceLevel - The resistance level
 * @returns {string[]} - The reordered lines
 */
function ensureStageOrdering(
  lines,
  resistantCharacter,
  emotionalStages,
  resistanceLevel = "Medium"
) {
  // Define the correct order of stages based on resistance level
  let orderedStages = [];

  switch (resistanceLevel) {
    case "Low":
      orderedStages = ["early", "middle", "shift", "conclusion"];
      break;
    case "High":
      orderedStages = [
        "early",
        "resistance1",
        "resistance2",
        "resistance3",
        "beginning_crack",
        "shift",
        "reluctant_acceptance",
        "conclusion",
      ];
      break;
    case "Medium":
    default:
      orderedStages = [
        "early",
        "conflict1",
        "shift",
        "acceptance",
        "conclusion",
      ];
      break;
  }

  const characterLines = [];

  // Identify character lines and their stages
  for (let i = 0; i < lines.length; i++) {
    const emotionMatch = lines[i].match(/🗣\s+([^(]+)\s*\(([^)]+)\):/);
    if (emotionMatch && emotionMatch[1].trim() === resistantCharacter) {
      const emotion = emotionMatch[2].trim().toLowerCase();
      let stage = null;

      for (const [stageName, emotions] of Object.entries(emotionalStages)) {
        if (emotions.includes(emotion)) {
          stage = stageName;
          break;
        }
      }

      if (stage) {
        characterLines.push({ index: i, stage, line: lines[i] });
      }
    }
  }

  // Check if stages are in the right order
  let correctOrder = true;
  let lastStageIndex = -1;

  for (const line of characterLines) {
    const currentStageIndex = orderedStages.indexOf(line.stage);
    if (currentStageIndex < lastStageIndex) {
      correctOrder = false;
      break;
    }
    lastStageIndex = currentStageIndex;
  }

  // If order is incorrect, rearrange resistant character lines
  if (!correctOrder && characterLines.length >= orderedStages.length) {
    // Create a mapping of stage to line
    const stageToLine = {};
    for (const line of characterLines) {
      if (!stageToLine[line.stage]) {
        stageToLine[line.stage] = line;
      }
    }

    // Replace lines in the correct order
    for (let i = 0; i < characterLines.length; i++) {
      const expectedStage =
        orderedStages[Math.min(i, orderedStages.length - 1)];
      if (stageToLine[expectedStage]) {
        lines[characterLines[i].index] = stageToLine[expectedStage].line;
      }
    }
  }

  return lines;
}

// Export functions that haven't been exported yet
export { generateScript };
