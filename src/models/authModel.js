const { db } = require("../Firebase/firebaseAdmin");



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
