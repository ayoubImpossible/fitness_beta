/*const { createFirebaseUser, verifyFirebaseToken } = require("../services/authService");
const { addUser, getUserByUID } = require("../models/authModel");

// Signup Controller
const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Create Firebase user
    const uid = await createFirebaseUser(email, password);

    // Add user to Firestore
    await addUser(uid, email);

    res.status(201).send({ message: "User registered successfully", uid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
// Login Controller
const login = async (req, res) => {
  const { idToken } = req.body;
  

  try {
    // Verify Firebase ID token
    const decodedToken = await verifyFirebaseToken(idToken);

    // Get user details from Firestore
    const user = await getUserByUID(decodedToken.uid);
    if (!user) {
      return res.status(404).send({ error: "User not found in Firestore" });
    }

    res.status(200).send({ message: "Login successful", user });
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

module.exports = { signup, login };*/
