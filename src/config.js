// Configuration for the application
// In a production environment, these would be stored in environment variables

/**
 * Firebase configuration
 * Replace these with your actual Firebase config values
 */
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID",
};

/**
 * OpenAI configuration
 * Replace with your actual OpenAI API key
 */
export const openAIConfig = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY",
};

/**
 * Authentication configuration
 */
export const authConfig = {
  authorizedUserUID: process.env.REACT_APP_AUTHORIZED_USER_UID,
};
