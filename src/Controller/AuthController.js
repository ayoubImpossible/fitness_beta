const { db, auth } = require('../Firebase/firebaseAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadImageUser } = require('../Utils/Helpers');

// Register User
const register = async (req, res) => {
    const { email, password, name } = req.body;
    const file=req.file;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await auth.createUser({ email, password: hashedPassword });
      if (file) {
        imageUrl = await uploadImageUser(file); // Upload image to Firebase Storage
      }
      // Store the hashed password in Firestore
      await db.collection('users').doc(user.uid).set({ 
        email, 
        name,
        password: hashedPassword, // Store the hashed password here
        imageUser:imageUrl || null
      });
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  };
// Login User
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const userRecord = await auth.getUserByEmail(email);
      const userSnapshot = await db.collection('users').doc(userRecord.uid).get();
      const user = userSnapshot.data();
  
      // Make sure the password is stored in Firestore as well
      if (!user || !user.password) {
        return res.status(400).json({ message: 'User not found or password not set' });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
  
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };
  

module.exports = { register, login };
