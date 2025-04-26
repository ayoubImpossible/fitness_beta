const {auth} = require("../Firebase/firebaseAdmin")

const createFirebaseUser = async (email, password) => {
  try {
    const user = await auth.createUser({ email, password });
    return user.uid;
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = { createFirebaseUser, verifyFirebaseToken };
