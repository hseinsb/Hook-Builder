import React, { useState, useEffect } from "react";
import { getRecentHookResults } from "../services/firebaseService";
import "./SavedHooks.css";

const SavedHooks = () => {
  const [savedHooks, setSavedHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchSavedHooks = async () => {
      try {
        setLoading(true);
        const results = await getRecentHookResults(20);
        setSavedHooks(results);
      } catch (error) {
        console.error("Error fetching saved hooks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedHooks();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="saved-hooks-container loading">
        <h2>Saved Hooks</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (savedHooks.length === 0) {
    return (
      <div className="saved-hooks-container empty">
        <h2>Saved Hooks</h2>
        <p className="no-hooks-message">
          No saved hooks found. Save a hook variation to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="saved-hooks-container">
      <h2>Saved Hooks</h2>
      <div className="saved-hooks-list">
        {savedHooks.map((hook) => (
          <div
            key={hook.id}
            className={`saved-hook-item ${expanded[hook.id] ? "expanded" : ""}`}
            onClick={() => toggleExpand(hook.id)}
          >
            <div className="hook-header">
              <div className="hook-text">"{hook.selectedVariation}"</div>
              <div className="hook-meta">
                <span className="hook-date">{formatDate(hook.timestamp)}</span>
                <span className="hook-score">Score: {hook.tripScore}/10</span>
              </div>
            </div>

            {expanded[hook.id] && (
              <div className="hook-details">
                <div className="detail-section">
                  <h4>Original Hook:</h4>
                  <p>"{hook.originalHook}"</p>
                </div>

                <div className="detail-actions">
                  <button
                    className="action-button copy-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(hook.selectedVariation);
                      alert("Copied to clipboard!");
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedHooks;
