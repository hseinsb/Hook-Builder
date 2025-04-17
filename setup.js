const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n✨ Hook Builder - T.R.I.P. Framework Setup ✨\n");
console.log(
  "This script will help you configure your environment variables.\n"
);

// Template for .env file
const envTemplate = `# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=%FIREBASE_API_KEY%
REACT_APP_FIREBASE_AUTH_DOMAIN=%FIREBASE_AUTH_DOMAIN%
REACT_APP_FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID%
REACT_APP_FIREBASE_STORAGE_BUCKET=%FIREBASE_STORAGE_BUCKET%
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=%FIREBASE_MESSAGING_SENDER_ID%
REACT_APP_FIREBASE_APP_ID=%FIREBASE_APP_ID%
REACT_APP_FIREBASE_MEASUREMENT_ID=%FIREBASE_MEASUREMENT_ID%

# OpenAI Configuration
REACT_APP_OPENAI_API_KEY=%OPENAI_API_KEY%

# User Authentication
REACT_APP_AUTHORIZED_USER_UID=%AUTHORIZED_USER_UID%
`;

// Function to ask for user input
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Main setup function
const setup = async () => {
  console.log("Please enter your Firebase configuration:");

  const firebaseApiKey = await askQuestion("Firebase API Key: ");
  const firebaseAuthDomain = await askQuestion("Firebase Auth Domain: ");
  const firebaseProjectId = await askQuestion("Firebase Project ID: ");
  const firebaseStorageBucket = await askQuestion("Firebase Storage Bucket: ");
  const firebaseMessagingSenderId = await askQuestion(
    "Firebase Messaging Sender ID: "
  );
  const firebaseAppId = await askQuestion("Firebase App ID: ");
  const firebaseMeasurementId = await askQuestion("Firebase Measurement ID: ");

  console.log("\nPlease enter your OpenAI configuration:");
  const openaiApiKey = await askQuestion("OpenAI API Key: ");

  console.log("\nPlease enter your authentication configuration:");
  const authorizedUserUid = await askQuestion("Authorized User UID: ");

  // Replace placeholders in template
  let envContent = envTemplate
    .replace("%FIREBASE_API_KEY%", firebaseApiKey)
    .replace("%FIREBASE_AUTH_DOMAIN%", firebaseAuthDomain)
    .replace("%FIREBASE_PROJECT_ID%", firebaseProjectId)
    .replace("%FIREBASE_STORAGE_BUCKET%", firebaseStorageBucket)
    .replace("%FIREBASE_MESSAGING_SENDER_ID%", firebaseMessagingSenderId)
    .replace("%FIREBASE_APP_ID%", firebaseAppId)
    .replace("%FIREBASE_MEASUREMENT_ID%", firebaseMeasurementId)
    .replace("%OPENAI_API_KEY%", openaiApiKey)
    .replace("%AUTHORIZED_USER_UID%", authorizedUserUid);

  // Write to .env file
  fs.writeFileSync(path.join(__dirname, ".env"), envContent);

  console.log(
    "\n✅ Setup complete! Environment variables have been saved to .env file."
  );
  console.log("You can now start the application with: npm start\n");

  rl.close();
};

// Run setup
setup().catch((err) => {
  console.error("Error during setup:", err);
  rl.close();
});
