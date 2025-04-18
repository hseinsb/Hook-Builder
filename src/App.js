import React, { useState, useEffect } from "react";
import "./App.css";
import HookForm from "./components/HookForm";
import HookResults from "./components/HookResults";
import SavedHooks from "./components/SavedHooks";
import SavedScripts from "./components/SavedScripts";
import ScriptGenerator from "./components/ScriptGenerator";
import Login from "./components/Login";
import Header from "./components/Header";
import ApiTest from "./ApiTest";
import { analyzeHook } from "./services/openaiService";
import { getCurrentUser, isAuthorizedUser } from "./services/firebaseService";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeSection, setActiveSection] = useState("hook"); // 'hook', 'saved', 'script', 'savedScripts', or 'apitest'
  const [editScriptData, setEditScriptData] = useState(null); // Data for editing a saved script

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && isAuthorizedUser(currentUser.uid)) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    setResults(null);
    setActiveSection("hook");
    setEditScriptData(null);
  };

  const handleHookSubmit = async (hookData) => {
    setIsLoading(true);
    try {
      const hookAnalysis = await analyzeHook(hookData);
      setResults(hookAnalysis);
    } catch (error) {
      console.error("Error analyzing hook:", error);
      alert("Failed to analyze hook. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset edit script data when changing sections (unless going to script section for editing)
  useEffect(() => {
    if (activeSection !== "script") {
      setEditScriptData(null);
    }
  }, [activeSection]);

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="app auth-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login screen
  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // If authenticated, show the main application
  return (
    <AuthProvider>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />

        <div className="app-nav">
          <button
            className={`nav-button ${activeSection === "hook" ? "active" : ""}`}
            onClick={() => setActiveSection("hook")}
          >
            Hook Builder
          </button>
          <button
            className={`nav-button ${
              activeSection === "script" ? "active" : ""
            }`}
            onClick={() => setActiveSection("script")}
          >
            Script Generator
          </button>
          <button
            className={`nav-button ${
              activeSection === "saved" ? "active" : ""
            }`}
            onClick={() => setActiveSection("saved")}
          >
            Saved Hooks
          </button>
          <button
            className={`nav-button ${
              activeSection === "savedScripts" ? "active" : ""
            }`}
            onClick={() => setActiveSection("savedScripts")}
          >
            Saved Scripts
          </button>
          <button
            className={`nav-button ${
              activeSection === "apitest" ? "active" : ""
            }`}
            onClick={() => setActiveSection("apitest")}
          >
            API Test
          </button>
        </div>

        <main className="app-content">
          {activeSection === "hook" && (
            <>
              <HookForm onSubmit={handleHookSubmit} isDisabled={isLoading} />

              {isLoading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Analyzing your hook with the T.R.I.P. framework...</p>
                </div>
              )}

              {results && !isLoading && (
                <HookResults
                  results={results}
                  onSaveSuccess={() => setActiveSection("saved")}
                />
              )}
            </>
          )}

          {activeSection === "saved" && <SavedHooks />}

          {activeSection === "savedScripts" && (
            <SavedScripts
              setActiveSection={setActiveSection}
              setEditScriptData={setEditScriptData}
            />
          )}

          {activeSection === "script" && (
            <ScriptGenerator
              initialData={editScriptData}
              onSaveSuccess={() => setActiveSection("savedScripts")}
            />
          )}

          {activeSection === "apitest" && <ApiTest />}
        </main>

        <footer className="app-footer">
          <p>
            &copy; {new Date().getFullYear()} Hook Builder - T.R.I.P. Framework
          </p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
