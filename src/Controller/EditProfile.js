const { getAuth } = require("firebase-admin/auth");
const { uploadImageUser } = require("../Utils/Helpers");
const { db } = require('../Firebase/firebaseAdmin');



// Update user profile
const updateProfile = async (req, res) => {
  const { uid } = req.params; // Get user UID from request
  const { fullName, email, newPassword } = req.body;
  const file = req.file; // Profile image file

  try {
    let profileImageUrl = null;
    // Upload new profile image if provided
    if (file) {
      profileImageUrl = await uploadImageUser(file);
    }

    // Find user document where uid matches
    const userQuerySnapshot = await db.collection("users").where("uid", "==", uid).get();

    if (userQuerySnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDocRef = userQuerySnapshot.docs[0].ref;

    // Update Firestore user document
    await userDocRef.update({
      fullName,
      email,
      ...(profileImageUrl && { profileImageUrl }),
    });

       // Update Firebase Authentication email
       await getAuth().updateUser(uid, { email });
    // Handle password change
    if (newPassword) {
      await getAuth().updateUser(uid, { password: newPassword });
    }

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { updateProfile };
