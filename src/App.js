import React, { useState, useEffect } from "react";
import "./App.css";
import HookForm from "./components/HookForm";
import HookResults from "./components/HookResults";
import SavedHooks from "./components/SavedHooks";
import Login from "./components/Login";
import Header from "./components/Header";
import { analyzeHook } from "./services/openaiService";
import { getCurrentUser, isAuthorizedUser } from "./services/firebaseService";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSavedHooks, setShowSavedHooks] = useState(false);

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
    setShowSavedHooks(false);
  };

  const handleHookSubmit = async (hookData) => {
    setIsLoading(true);
    setShowSavedHooks(false);
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

  const toggleSavedHooks = () => {
    setShowSavedHooks((prev) => !prev);
    // If showing saved hooks, clear the current results
    if (!showSavedHooks) {
      setResults(null);
    }
  };

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
    <div className="app">
      <Header user={user} onLogout={handleLogout} />

      <div className="app-actions">
        <button
          className={`toggle-button ${!showSavedHooks ? "active" : ""}`}
          onClick={() => setShowSavedHooks(false)}
        >
          Analyze Hook
        </button>
        <button
          className={`toggle-button ${showSavedHooks ? "active" : ""}`}
          onClick={() => setShowSavedHooks(true)}
        >
          Saved Hooks
        </button>
      </div>

      <main className="app-content">
        {!showSavedHooks ? (
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
                onSaveSuccess={() => setShowSavedHooks(true)}
              />
            )}
          </>
        ) : (
          <SavedHooks />
        )}
      </main>

      <footer className="app-footer">
        <p>
          &copy; {new Date().getFullYear()} Hook Builder - T.R.I.P. Framework
        </p>
      </footer>
    </div>
  );
}

export default App;
