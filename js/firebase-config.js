/**
 * Firebase Configuration for Vica Domino
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (e.g., "vica-domino")
 * 3. Go to Project Settings > General > Your apps > Add web app
 * 4. Copy the firebaseConfig values below
 * 5. Go to Firestore Database > Create database > Start in test mode
 * 6. Replace the placeholder values below with your actual config
 */

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

/**
 * Superusers — these user names have full access (create/edit cards and games).
 * All other users can only play games that superusers created.
 * Add names exactly as they type them at login (case-sensitive).
 */
const SUPERUSERS = ['Vica'];
