const { db } = require("../Firebase/firebaseAdmin");

/*// Get user details from Firestore by UID
const getUserByUID = async (uid) => {
  const userDoc = await db.collection("users").doc(uid).get();
  return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
};*/
/*// Add a new user to Firestore
const addUser = async (uid, email, additionalData = {}) => {
  const userRef = db.collection("users").doc(uid);
  const userData = { email, ...additionalData, createdAt: new Date() };

  await userRef.set(userData);
  return uid;
};*/

// Update user data in Firestore
const updateUser = async (uid, updatedData) => {
  const userRef = db.collection("users").doc(uid);
  await userRef.update(updatedData);
};

// Delete a user from Firestore
const deleteUser = async (uid) => {
  const userRef = db.collection("users").doc(uid);
  await userRef.delete();
};

module.exports = {

  updateUser,
  deleteUser,
};
