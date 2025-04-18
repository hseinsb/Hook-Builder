import React, { useState } from "react";
import OpenAI from "openai";
import { openAIConfig } from "./config";

const ApiTest = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testApi = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      // Log the API key (first few characters)
      const apiKey = openAIConfig.apiKey || "";
      console.log("API Key (first 10 chars):", apiKey.substring(0, 10) + "...");

      if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY") {
        throw new Error("OpenAI API key is missing or invalid.");
      }

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      // Make a simple API call
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: "Say hello and confirm the API connection works.",
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      // Set result
      if (response && response.choices && response.choices[0]) {
        setResult(response.choices[0].message.content);
      } else {
        throw new Error("No response from API");
      }
    } catch (err) {
      console.error("OpenAI API Test Error:", err);
      setError(`API Test Failed: ${err.message}`);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        setError(
          `API Test Failed: ${err.response.status} - ${JSON.stringify(
            err.response.data
          )}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>OpenAI API Test</h2>
      <button
        onClick={testApi}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "#ccc" : "#0066ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "Testing..." : "Test OpenAI API"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "20px",
            padding: "10px",
            background: "rgba(255,0,0,0.1)",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response:</h3>
          <div
            style={{
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "4px",
              color: "#333",
            }}
          >
            {result}
          </div>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h3>Troubleshooting:</h3>
        <ul style={{ lineHeight: "1.6" }}>
          <li>Make sure your OpenAI API key is valid</li>
          <li>Verify your API key has the necessary permissions</li>
          <li>Check if your API key has been rotated or expired</li>
          <li>Ensure your API usage is within rate limits</li>
          <li>If using a new API key, it may take a few minutes to activate</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
