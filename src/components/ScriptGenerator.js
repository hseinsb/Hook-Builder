import React, { useState, useEffect } from "react";
import "./ScriptGenerator.css";
import { generateScript } from "../services/openaiService";
import { saveScript, deleteScript } from "../services/firebaseService";
import { auth } from "../firebase";

const CHARACTER_OPTIONS = [1, 2, 3];

const TONE_OPTIONS = [
  "Raw & Direct (Brutally honest, zero sugar-coating)",
  "Cold & Dismissive (Harsh truth-teller, doesn't care if it hurts)",
  "Aggressive Challenger (Confrontational, calls out weakness)",
  "Sharp Sarcasm (Cutting remarks, mocks weak thinking)",
  "Explosive Anger (Sudden bursts of raw emotion)",
  "Grounded Contempt (Calm but devastating criticism)",
  "Masculine Wisdom (Hard lessons earned through pain)",
  "Final Warning (Last chance before consequences)",
];

const THEME_OPTIONS = [
  "Masculinity",
  "Faith",
  "Trauma",
  "Logic vs Emotion",
  "Society",
  "Religion",
  "Family",
  "Ego",
  "Growth",
  "Discipline",
  "Self-worth",
  "Obsession",
  "Spiritual growth",
  "Mental strength",
  "Relationships",
  "Truth seeking",
  "Facing reality",
];

const EMOTIONAL_ARC_OPTIONS = [
  "Denial to acceptance",
  "Ignorance to understanding",
  "Ego to humility",
  "Conflict without resolution (tension remains)",
  "Explosive confrontation (truth bombs)",
  "Quiet realization (ending in reflection)",
];

const ScriptGenerator = ({ initialData, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    philosophy: "",
    numCharacters: 2,
    characterRoles: "",
    tone: "",
    themes: [],
    emotionalArc: "",
    hookDirective: "",
    finalMicDrop: "",
    creatorNote: "",
    originalScriptId: null, // Track if we're editing an existing script
  });

  const [isLoading, setIsLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState(null);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  // Initialize form with data if provided for editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumCharactersChange = (e) => {
    const numCharacters = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      numCharacters,
      characterRoles: "", // Reset character roles when changing number of characters
    }));
  };

  const handleThemeChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          themes: [...prev.themes, value],
        };
      } else {
        return {
          ...prev,
          themes: prev.themes.filter((theme) => theme !== value),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.philosophy.trim()) {
      setError("Please enter your philosophical idea");
      return;
    }

    if (!formData.characterRoles.trim()) {
      setError("Please define character roles");
      return;
    }

    if (!formData.tone) {
      setError("Please select a tone");
      return;
    }

    if (formData.themes.length === 0) {
      setError("Please select at least one theme");
      return;
    }

    if (!formData.emotionalArc) {
      setError("Please select an emotional arc");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Always request music recommendation
      const dataToSend = {
        ...formData,
        musicRecommendation: true,
      };

      const result = await generateScript(dataToSend);

      // Check if we have a proper script result
      if (!result || !result.script || result.script.trim().length < 30) {
        throw new Error(
          "The API returned an invalid script. This may be due to an authentication issue with the OpenAI API key."
        );
      }

      setScriptResult(result);
    } catch (err) {
      console.error("Error generating script:", err);
      setError(
        `Failed to generate script: ${
          err.message || "Please check your OpenAI API key in the config file."
        }`
      );
      setScriptResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!scriptResult?.script) return;

    navigator.clipboard.writeText(scriptResult.script);
    alert("Script copied to clipboard!");
  };

  const handleSaveScript = async () => {
    if (!auth.currentUser) {
      setSaveStatus("You must be logged in to save scripts");
      return;
    }

    try {
      setSaveStatus("Saving...");

      // Prepare data for saving
      const scriptData = {
        title: formData.title || "Untitled Script",
        philosophy: formData.philosophy,
        numCharacters: formData.numCharacters,
        characterRoles: formData.characterRoles,
        tone: formData.tone,
        themes: formData.themes,
        emotionalArc: formData.emotionalArc,
        hookDirective: formData.hookDirective,
        finalMicDrop: formData.finalMicDrop,
        creatorNote: formData.creatorNote,
        musicRecommendation: true,
        scriptContent: scriptResult.script,
        musicRecommendationContent: scriptResult.musicRecommendation || null,
        userId: auth.currentUser.uid,
      };

      // If editing an existing script, delete the old one first
      if (formData.originalScriptId) {
        await deleteScript(formData.originalScriptId);
      }

      // Save as a new script
      await saveScript(scriptData);

      setSaveStatus("Script saved successfully!");

      // Clear save status after 3 seconds
      setTimeout(() => {
        setSaveStatus("");
        // Navigate to saved scripts if callback provided
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      }, 3000);
    } catch (error) {
      console.error("Error saving script:", error);
      setSaveStatus("Failed to save script. Please try again.");
    }
  };

  const handleReset = () => {
    // If we're editing, clear original script ID
    if (formData.originalScriptId) {
      setFormData({
        title: "",
        philosophy: "",
        numCharacters: 2,
        characterRoles: "",
        tone: "",
        themes: [],
        emotionalArc: "",
        hookDirective: "",
        finalMicDrop: "",
        creatorNote: "",
        originalScriptId: null,
      });
    } else {
      // Just clear the result if generating a new script
      setScriptResult(null);
    }
    setError(null);
    setSaveStatus("");
  };

  const renderScript = (scriptText) => {
    if (!scriptText) return null;

    // Sanitize and format the script text before rendering
    scriptText = sanitizeScriptFormat(scriptText);

    // Split script by lines and process each line
    const lines = scriptText.split("\n");
    const renderedLines = [];

    let inCharacterBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        // Handle empty lines
        renderedLines.push(
          <div key={`empty-${i}`} className="script-empty-line" />
        );
        inCharacterBlock = false;
      }
      // Check if this is a character line (contains 🗣)
      else if (line.includes("🗣")) {
        // Add extra spacing before a new character block
        if (inCharacterBlock) {
          renderedLines.push(
            <div key={`spacer-${i}`} className="script-empty-line" />
          );
        }

        renderedLines.push(
          <div key={`char-${i}`} className="script-character-line">
            {line}
          </div>
        );
        inCharacterBlock = true;
      }
      // Check if this is a stage direction
      else if (line.startsWith("(") && line.endsWith(")")) {
        // Stage direction
        renderedLines.push(
          <div key={`stage-${i}`} className="script-stage-direction">
            {line}
          </div>
        );
      }
      // Otherwise it's dialogue
      else {
        // Dialogue line
        renderedLines.push(
          <div key={`dialogue-${i}`} className="script-dialogue-line">
            {line}
          </div>
        );
      }
    }

    return <div className="script-content">{renderedLines}</div>;
  };

  // Add a new function to sanitize and format the script text
  const sanitizeScriptFormat = (scriptText) => {
    if (!scriptText) return "";

    // Step 1: Ensure proper spacing after colons in character lines
    scriptText = scriptText.replace(/(:)"(\s*)/g, ': "$2');
    scriptText = scriptText.replace(/(:)(\s*)([^"\s])/g, ": $3");

    // Step 2: Extract and properly format stage directions on their own lines
    const extractStageDirections = (text) => {
      // Match character dialogue followed by stage direction in the same line
      return text.replace(
        /(".*?")\s*(\([^)]+\))/g,
        (match, dialogue, stageDirection) => {
          return `${dialogue}\n${stageDirection}`;
        }
      );
    };
    scriptText = extractStageDirections(scriptText);

    // Step 3: Ensure proper spacing between character blocks
    // Split by character lines (🗣) and rejoin with double newlines
    const parts = scriptText.split(/(?=🗣)/);
    scriptText = parts.join("\n\n").replace(/\n{3,}/g, "\n\n");

    // Step 4: Fix quotation marks and trailing/leading spaces
    const lines = scriptText.split("\n");
    const fixedLines = lines.map((line) => {
      // Skip character lines and stage directions for this fix
      if (line.includes("🗣") || (line.startsWith("(") && line.endsWith(")"))) {
        return line.trim();
      }

      // Fix quotation marks for dialogue lines
      let fixed = line
        .trim()
        .replace(/^"/, "") // Remove leading quotation mark
        .replace(/"$/, ""); // Remove trailing quotation mark

      // Ensure dialogue ends with proper punctuation
      if (fixed && !fixed.match(/[.!?…]$/)) {
        fixed += ".";
      }

      return fixed;
    });

    return fixedLines.join("\n");
  };

  return (
    <div className="script-generator-container">
      <h2>Generate Cinematic Scripts</h2>
      <p className="description">
        Transform your philosophical ideas into powerful, dialogue-driven
        scripts for TikTok and Instagram Reels.
      </p>

      {error && <div className="error-message">{error}</div>}

      {!scriptResult ? (
        <form onSubmit={handleSubmit} className="script-form">
          {formData.originalScriptId && (
            <div className="edit-mode-notification">
              <p>
                You are editing a saved script. Generate a new version with your
                changes.
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a title for your script"
            />
          </div>

          <div className="form-group">
            <label htmlFor="philosophy">Your Philosophy or Idea *</label>
            <textarea
              id="philosophy"
              name="philosophy"
              rows="5"
              value={formData.philosophy}
              onChange={handleChange}
              placeholder="Enter your philosophical idea or concept that you want transformed into a script..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="numCharacters">Number of Characters *</label>
            <select
              id="numCharacters"
              name="numCharacters"
              value={formData.numCharacters}
              onChange={handleNumCharactersChange}
              required
            >
              {CHARACTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} {option === 1 ? "Character" : "Characters"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="characterRoles">
              Character Roles/Descriptions *
              {formData.numCharacters === 1 && " (Protagonist)"}
              {formData.numCharacters === 2 &&
                " (Truth-teller & Resistant Friend)"}
              {formData.numCharacters === 3 &&
                " (Truth-teller, Resistant Friend, Neutral/Curious Observer)"}
            </label>
            <input
              type="text"
              id="characterRoles"
              name="characterRoles"
              value={formData.characterRoles}
              onChange={handleChange}
              placeholder={
                formData.numCharacters === 1
                  ? "E.g., Wise Mentor"
                  : formData.numCharacters === 2
                  ? "E.g., Mentor, Student"
                  : "E.g., Mentor, Student, Friend"
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tone">Tone *</label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              required
            >
              <option value="">Select a tone</option>
              {TONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Themes (Select at least one) *</label>
            <div className="theme-options">
              {THEME_OPTIONS.map((theme) => (
                <div key={theme} className="theme-option">
                  <input
                    type="checkbox"
                    id={`theme-${theme}`}
                    name="themes"
                    value={theme}
                    checked={formData.themes.includes(theme)}
                    onChange={handleThemeChange}
                  />
                  <label htmlFor={`theme-${theme}`}>{theme}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emotionalArc">Emotional Arc *</label>
            <select
              id="emotionalArc"
              name="emotionalArc"
              value={formData.emotionalArc}
              onChange={handleChange}
              required
            >
              <option value="">Select an emotional arc</option>
              {EMOTIONAL_ARC_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hookDirective">Hook Directive (Optional)</label>
            <input
              type="text"
              id="hookDirective"
              name="hookDirective"
              value={formData.hookDirective}
              onChange={handleChange}
              placeholder="E.g., Start with a shocking statement about relationships"
            />
          </div>

          <div className="form-group">
            <label htmlFor="finalMicDrop">Final Mic Drop Line (Optional)</label>
            <input
              type="text"
              id="finalMicDrop"
              name="finalMicDrop"
              value={formData.finalMicDrop}
              onChange={handleChange}
              placeholder="E.g., You either face this now or it faces you later"
            />
          </div>

          <div className="form-group">
            <label htmlFor="creatorNote">📝 Creator Note (Optional)</label>
            <textarea
              id="creatorNote"
              name="creatorNote"
              rows="4"
              maxLength="700"
              value={formData.creatorNote}
              onChange={handleChange}
              placeholder="Use this to add custom instructions, style preferences, opening lines, tone guidance, or any unique direction for the script. For example: 'Start with the sarcastic character mocking the philosophy' or 'Use a nostalgic tone — like two brothers looking back at childhood'."
            ></textarea>
            <div className="field-description">
              Custom guidance for the AI. This will shape the script's style and
              approach within the framework.
              <span className="character-count">
                {formData.creatorNote.length}/700 characters
              </span>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading
              ? "Generating..."
              : formData.originalScriptId
              ? "Regenerate Script"
              : "Generate Script"}
          </button>

          {formData.originalScriptId && (
            <button
              type="button"
              className="cancel-button"
              onClick={handleReset}
            >
              Cancel Editing
            </button>
          )}
        </form>
      ) : (
        <div className="script-results">
          <h3>
            {formData.originalScriptId ? "Updated Script" : "Generated Script"}
          </h3>

          <div className="script-actions-bar">
            <button onClick={handleCopyToClipboard} className="copy-button">
              Copy to Clipboard
            </button>
            <button onClick={handleSaveScript} className="save-button">
              {formData.originalScriptId ? "Save Changes" : "Save Script"}
            </button>
            <button onClick={handleReset} className="reset-button">
              {formData.originalScriptId ? "Cancel" : "Generate Another"}
            </button>
          </div>

          {saveStatus && <div className="save-status">{saveStatus}</div>}

          {scriptResult.script && renderScript(scriptResult.script)}

          {scriptResult.musicRecommendation && (
            <div className="music-recommendation">
              <h4>Music Recommendation</h4>
              <p>{scriptResult.musicRecommendation}</p>
            </div>
          )}

          <div className="script-info-section">
            <h4>Script Information</h4>
            <div className="script-info-grid">
              <div className="info-item">
                <span className="info-label">Characters:</span>
                <span className="info-value">
                  {formData.numCharacters} ({formData.characterRoles})
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Tone:</span>
                <span className="info-value">{formData.tone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Themes:</span>
                <span className="info-value">{formData.themes.join(", ")}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Emotional Arc:</span>
                <span className="info-value">{formData.emotionalArc}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;
