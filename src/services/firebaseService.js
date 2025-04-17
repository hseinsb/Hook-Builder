import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { firebaseConfig, authConfig } from "../config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Check if a user is authorized to use the application
 * @param {string} uid - The user's UID
 * @returns {boolean} - Whether the user is authorized
 */
export const isAuthorizedUser = (uid) => {
  return uid === authConfig.authorizedUserUID;
};

/**
 * Sign in with email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise} - The promise of the sign in operation
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check if the user is authorized
    if (!isAuthorizedUser(user.uid)) {
      await signOut(auth);
      throw new Error("Unauthorized user");
    }

    return user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise} - The promise of the sign out operation
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Get the current user
 * @returns {Promise} - The promise resolving to the current user
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

/**
 * Save a hook result to Firebase
 * @param {Object} hookData - The hook data to save
 * @returns {Promise} - The promise of the save operation
 */
export const saveHookResult = async (hookData) => {
  try {
    const docRef = await addDoc(collection(db, "hookResults"), hookData);
    console.log("Hook result saved with ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error saving hook result: ", error);
    throw error;
  }
};

/**
 * Get recent hook results from Firebase
 * @param {number} resultsLimit - The number of results to fetch
 * @returns {Promise<Array>} - The promise of the fetch operation
 */
export const getRecentHookResults = async (resultsLimit = 10) => {
  try {
    const q = query(
      collection(db, "hookResults"),
      orderBy("timestamp", "desc"),
      limit(resultsLimit)
    );

    const querySnapshot = await getDocs(q);
    const results = [];

    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return results;
  } catch (error) {
    console.error("Error fetching recent hook results: ", error);
    throw error;
  }
};
