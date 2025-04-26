const { db } = require('../Firebase/firebaseAdmin');

// Get User Profile
const getUserProfile = async (req, res) => {
  try {

    const userSnapshot = await db.collection('users').doc(req.userId).get();
    
    if (!userSnapshot.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(userSnapshot.data());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
};

module.exports = { getUserProfile };
