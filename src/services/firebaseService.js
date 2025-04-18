import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { authConfig } from "../config";
import { db, auth } from "../firebase";

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
    throw error;
  }
};

/**
 * Save a script to Firebase
 * @param {Object} scriptData - The script data to save
 * @returns {Promise} - The promise of the save operation
 */
export const saveScript = async (scriptData) => {
  try {
    // Add a timestamp to the data
    const scriptWithTimestamp = {
      ...scriptData,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "scripts"), scriptWithTimestamp);
    console.log("Script saved with ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error saving script:", error);
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
      fsLimit(resultsLimit)
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

// Get all saved scripts for the current user
export const getSavedScripts = async () => {
  if (!auth.currentUser) {
    throw new Error("User must be signed in to fetch scripts");
  }

  try {
    const scriptsSnapshot = await getDocs(
      query(
        collection(db, "users", auth.currentUser.uid, "scripts"),
        orderBy("createdAt", "desc")
      )
    );

    return scriptsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error("Error fetching scripts:", error);
    throw error;
  }
};

// Delete a saved script
export const deleteScript = async (scriptId) => {
  if (!auth.currentUser) {
    throw new Error("User must be signed in to delete scripts");
  }

  try {
    // Delete from the scripts collection, not the nested path
    await deleteDoc(doc(db, "scripts", scriptId));
  } catch (error) {
    console.error("Error deleting script:", error);
    throw error;
  }
};
