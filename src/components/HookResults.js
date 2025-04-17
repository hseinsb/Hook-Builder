import React, { useState } from "react";
import "./HookResults.css";
import { saveHookResult } from "../services/firebaseService";

const HookResults = ({ results, onSaveSuccess }) => {
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleSaveVariation = async (variation) => {
    if (!variation) return;

    setIsSaving(true);
    try {
      await saveHookResult({
        originalHook: results.originalHook,
        selectedVariation: variation,
        tripScore: results.score,
        timestamp: new Date().toISOString(),
      });

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      if (onSaveSuccess) {
        setTimeout(() => onSaveSuccess(), 1000);
      }
    } catch (error) {
      console.error("Error saving result:", error);
      alert("Failed to save variation. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!results) return null;

  const {
    originalHook,
    score,
    tripBreakdown,
    feedback,
    variations,
    reframePrompt,
  } = results;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Hook Analysis Results</h2>
        <div className="overall-score">
          <span className="score-label">Overall Score:</span>
          <span className="score-value">{score}/10</span>
        </div>
      </div>

      <div className="original-hook">
        <h3>Your Original Hook</h3>
        <div className="hook-text">"{originalHook}"</div>
      </div>

      <div className="trip-breakdown">
        <h3>T.R.I.P. Framework Breakdown</h3>
        <div className="trip-grid">
          <div
            className={`trip-item ${
              tripBreakdown.tension ? "present" : "missing"
            }`}
          >
            <div className="item-header">
              <span className="item-letter">T</span>
              <span className="item-name">Tension</span>
              <span className="item-check">
                {tripBreakdown.tension ? "✅" : "❌"}
              </span>
            </div>
            <p>Introduces emotional, spiritual, or psychological conflict</p>
          </div>

          <div
            className={`trip-item ${
              tripBreakdown.relatability ? "present" : "missing"
            }`}
          >
            <div className="item-header">
              <span className="item-letter">R</span>
              <span className="item-name">Relatability</span>
              <span className="item-check">
                {tripBreakdown.relatability ? "✅" : "❌"}
              </span>
            </div>
            <p>Reflects a common struggle or silent pain the audience feels</p>
          </div>

          <div
            className={`trip-item ${
              tripBreakdown.intrigue ? "present" : "missing"
            }`}
          >
            <div className="item-header">
              <span className="item-letter">I</span>
              <span className="item-name">Intrigue</span>
              <span className="item-check">
                {tripBreakdown.intrigue ? "✅" : "❌"}
              </span>
            </div>
            <p>Opens a mental loop that demands resolution</p>
          </div>

          <div
            className={`trip-item ${
              tripBreakdown.personalStakes ? "present" : "missing"
            }`}
          >
            <div className="item-header">
              <span className="item-letter">P</span>
              <span className="item-name">Personal Stakes</span>
              <span className="item-check">
                {tripBreakdown.personalStakes ? "✅" : "❌"}
              </span>
            </div>
            <p>Feels like a raw emotional confession or real moment</p>
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <h3>Feedback Summary</h3>
        <p className="feedback-text">{feedback}</p>
      </div>

      <div className="variations-section">
        <h3>Refined Hook Variations</h3>
        <div className="variations-list">
          {variations.map((variation, index) => (
            <div
              key={index}
              className={`variation-item ${
                selectedVariation === variation ? "selected" : ""
              }`}
              onClick={() => setSelectedVariation(variation)}
            >
              <div className="variation-number">Variation {index + 1}</div>
              <div className="variation-text">"{variation}"</div>
              <div className="variation-actions">
                <button
                  className="action-button copy-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyToClipboard(variation);
                  }}
                >
                  Copy
                </button>
                <button
                  className="action-button save-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveVariation(variation);
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reframePrompt && (
        <div className="reframe-section">
          <h3>Alternative Approach</h3>
          <p className="reframe-text">{reframePrompt}</p>
        </div>
      )}

      {showSuccessMessage && (
        <div className="success-message">
          Hook variation saved successfully!
        </div>
      )}
    </div>
  );
};

export default HookResults;
