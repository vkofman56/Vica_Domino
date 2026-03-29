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
    apiKey: "AIzaSyBQP2y_WSOi6E46qY9m4i2BuP_8YGYVfuY",
    authDomain: "vica-domino.firebaseapp.com",
    projectId: "vica-domino",
    storageBucket: "vica-domino.firebasestorage.app",
    messagingSenderId: "476376420453",
    appId: "1:476376420453:web:0879204e87b8b8c50eb68c"
};

/**
 * Superusers — these user names have full access (create/edit cards and games).
 * All other users can only play games that superusers created.
 * Add names exactly as they type them at login (case-sensitive).
 */
const SUPERUSERS = ['Vica'];
