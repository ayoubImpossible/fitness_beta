// const { admin } = require('../Firebase/firebaseAdmin');

// const verifyToken = async (req, res, next) => {
//     const idToken = req.headers.authorization?.split('Bearer ')[1];
//     console.log('Authorization Header:', req.headers.authorization); // Log the header

//     if (!idToken) {
//         return res.status(401).json({ error: 'No token provided' });
//     }
//     try {
//         const decodedToken = await admin.auth().verifyIdToken(idToken);
//         console.log('Decoded Token:', decodedToken); // Log the decoded token
//         req.user = decodedToken; // Add user info to the request
//         next();
//     } catch (error) {
//         console.error('Token verification error:', error); // Log any error in token verification
//         return res.status(401).json({ error: 'Unauthorized' });
//     }
// };

// module.exports = verifyToken;





const { admin } = require('../Firebase/firebaseAdmin');
const db = admin.firestore(); // Assuming you're using Firestore

const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    console.log('Authorization Header:', req.headers.authorization);

    if (!idToken) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        // Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Decoded Token:', decodedToken);
        
        // Add user info to the request
        req.user = decodedToken;
        
        // Check if user exists in your database
        const userRef = db.collection('users').doc(decodedToken.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log('New user detected, creating user record...');
            
            // Get full user info from Firebase Auth
            const userRecord = await admin.auth().getUser(decodedToken.uid);
            
            // Create new user document in your database
            const newUser = {
                uid: decodedToken.uid,
                email: userRecord.email,
                displayName: userRecord.displayName || '',
                photoURL: userRecord.photoURL || '',
                provider: userRecord.providerData[0]?.providerId || 'password', // 'google.com' or 'password'
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                // Add any other default fields your app needs
                // e.g., isActive: true, role: 'user', etc.
            };
            
            await userRef.set(newUser);
            console.log('User record created successfully:', decodedToken.uid);
            
            // Add the new user data to request
            req.userData = newUser;
        } else {
            console.log('Existing user found:', decodedToken.uid);
            req.userData = userDoc.data();
            
            // Optional: Update last login timestamp
            await userRef.update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ 
            error: 'Unauthorized',
            details: error.message 
        });
    }
};

module.exports = verifyToken;