# Hook Builder - T.R.I.P. Framework

A web application to help scriptwriters and video creators refine and optimize the hooks for their TikTok videos using the specialized T.R.I.P. emotional storytelling framework.

## Features

- **Hook Analysis**: Submit your script hook and get it evaluated based on the T.R.I.P. framework
- **Framework Breakdown**: See which T.R.I.P. elements your hook hits (Tension, Relatability, Intrigue, Personal Stakes)
- **Hook Rating**: Get a score out of 10 based on how well your hook performs
- **Personalized Feedback**: Receive targeted feedback on what works and what can be improved
- **Hook Variations**: Get 3 refined hook variations that preserve your voice and emotional tone
- **Alternative Approaches**: Receive optional suggestions for reframing your hook
- **Save Favorites**: Save your favorite hook variations to Firebase
- **Secure Access**: Authentication system allowing only authorized users to access the application

## Technologies Used

- React (UI Framework)
- Firebase (Authentication & Database)
- OpenAI API (LLM Integration)

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Firebase project created
- OpenAI API key
- Firebase user account for authentication

### Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd hook-builder
npm install
```

### Step 2: Configure Environment Variables

**Option 1: Using the Setup Script (Recommended)**

Run the setup script and follow the prompts to configure your environment variables:

```bash
npm run setup
```

This will guide you through entering your Firebase and OpenAI API credentials and create a `.env` file automatically.

**Option 2: Manual Configuration**

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_AUTHORIZED_USER_UID=your_authorized_user_uid
```

Alternatively, you can directly edit the `src/config.js` file with your API keys (not recommended for production).

### Step 3: Set Up Firebase Authentication

1. In the Firebase Console, go to the Authentication section
2. Enable Email/Password authentication
3. Add the user that will be authorized to use the application
4. Get the user's UID and add it to the .env file or config.js
5. Update the Firestore security rules to allow only that user to read/write data

### Step 4: Start the Development Server

```bash
npm start
```

This will start the application at [http://localhost:3000](http://localhost:3000).

### Step 5: Build for Production

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

## Authentication

The application is designed to only allow access to a single authorized user. The authentication flow works as follows:

1. When a user navigates to the app, they are presented with a login screen
2. After logging in, the app checks if the user's UID matches the authorized user's UID
3. If authorized, the user is granted access to the application
4. If not authorized, the user is immediately logged out and shown an error message

## The T.R.I.P. Framework

The T.R.I.P. framework evaluates hooks on four key dimensions:

- **T - Tension**: Introduces emotional, spiritual, or psychological conflict or friction
- **R - Relatability**: Reflects a common struggle or silent pain the audience feels
- **I - Intrigue**: Opens a mental loop that demands resolution
- **P - Personal Stakes**: Feels like a raw emotional confession or real moment

## Usage Guide

1. **Log in**: Enter your email and password to access the application
2. **Enter your hook**: Type in the first line of your video script
3. **Provide context**: Briefly describe the scene in 1-2 sentences
4. **Select emotion and theme**: Choose the primary emotion and theme from the dropdown
5. **Optional tone selection**: Select a tone for additional context
6. **Analyze**: Submit your hook for analysis
7. **Review results**: See your score, feedback, and refined variations
8. **Save favorites**: Click the "Save" button on variations you want to keep

## License

MIT

## Contact

For questions, support or feature requests, please contact [your-email@example.com].
