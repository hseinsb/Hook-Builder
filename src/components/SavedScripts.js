import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { deleteScript } from "../services/firebaseService";
import "./SavedScripts.css";

const SavedScripts = ({ setActiveSection, setEditScriptData }) => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedScriptId, setExpandedScriptId] = useState(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setError("You must be logged in to view saved scripts");
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "scripts"),
          where("userId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const scriptData = [];

        querySnapshot.forEach((doc) => {
          scriptData.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          });
        });

        // Sort by timestamp, newest first
        scriptData.sort((a, b) => b.timestamp - a.timestamp);
        setScripts(scriptData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching scripts:", err);
        setError("Failed to load scripts. Please try again later.");
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const handleDelete = async (scriptId) => {
    try {
      await deleteScript(scriptId);
      setScripts(scripts.filter((script) => script.id !== scriptId));
    } catch (err) {
      console.error("Error deleting script:", err);
      setError("Failed to delete script. Please try again.");
    }
  };

  const handleEdit = (script) => {
    // Prepare the script data for editing
    const editData = {
      title: script.title || "",
      philosophy: script.philosophy || "",
      numCharacters: script.numCharacters || 2,
      characterRoles: script.characterRoles || "",
      tone: script.tone || "",
      themes: script.themes || [],
      emotionalArc: script.emotionalArc || "",
      hookDirective: script.hookDirective || "",
      finalMicDrop: script.finalMicDrop || "",
      creatorNote: script.creatorNote || "",
      musicRecommendation: Boolean(script.musicRecommendationContent),
      originalScriptId: script.id, // to identify if we're editing an existing script
    };

    // Set the edit data in parent component
    setEditScriptData(editData);

    // Switch to script generator section
    setActiveSection("script");
  };

  const toggleExpand = (scriptId) => {
    setExpandedScriptId(expandedScriptId === scriptId ? null : scriptId);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Script copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setError("Failed to copy to clipboard");
      });
  };

  if (loading) {
    return (
      <div className="saved-scripts-container loading">
        Loading saved scripts...
      </div>
    );
  }

  if (error) {
    return <div className="saved-scripts-container error">{error}</div>;
  }

  if (scripts.length === 0) {
    return (
      <div className="saved-scripts-container empty">
        <h2>No Saved Scripts</h2>
        <p>Scripts you generate and save will appear here.</p>
      </div>
    );
  }

  return (
    <div className="saved-scripts-container">
      <h2>Your Saved Scripts</h2>
      <p className="script-count">
        You have {scripts.length} saved script{scripts.length !== 1 ? "s" : ""}
      </p>

      <div className="scripts-list">
        {scripts.map((script) => (
          <div key={script.id} className="script-card">
            <div className="script-header">
              <h3>{script.title || "Untitled Script"}</h3>
              <div className="script-tags">
                {script.tone && (
                  <span className="tag tone-tag">
                    {script.tone.split(" ")[0]}
                  </span>
                )}
                {script.themes &&
                  script.themes.slice(0, 3).map((theme, index) => (
                    <span key={index} className="tag theme-tag">
                      {theme}
                    </span>
                  ))}
                {script.themes && script.themes.length > 3 && (
                  <span className="tag theme-tag">
                    +{script.themes.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="script-metadata">
              <p>
                <strong>Idea:</strong>{" "}
                {script.philosophy
                  ? script.philosophy.substring(0, 80) +
                    (script.philosophy.length > 80 ? "..." : "")
                  : "No description"}
              </p>
              <p>
                Characters: {script.numCharacters}
                {script.characterRoles ? ` (${script.characterRoles})` : ""}
              </p>
              <p>Created: {script.timestamp.toLocaleString()}</p>
            </div>

            <div className="script-preview">
              <p>{script.scriptContent?.substring(0, 150)}...</p>
            </div>

            <div className="script-actions">
              <button
                className="view-button"
                onClick={() => toggleExpand(script.id)}
              >
                {expandedScriptId === script.id
                  ? "Hide Full Script"
                  : "View Full Script"}
              </button>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(script.scriptContent)}
              >
                Copy Script
              </button>
              <button
                className="edit-button"
                onClick={() => handleEdit(script)}
              >
                Edit Script
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(script.id)}
              >
                Delete
              </button>
            </div>

            {expandedScriptId === script.id && (
              <div className="full-script">
                <div className="script-content">
                  {script.scriptContent.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>

                {script.musicRecommendationContent && (
                  <div className="music-recommendation">
                    <h4>Music Recommendation:</h4>
                    <p>{script.musicRecommendationContent}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedScripts;
