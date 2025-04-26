const { admin } = require('../Firebase/firebaseAdmin');

const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    console.log('Authorization Header:', req.headers.authorization); // Log the header

    if (!idToken) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Decoded Token:', decodedToken); // Log the decoded token
        req.user = decodedToken; // Add user info to the request
        next();
    } catch (error) {
        console.error('Token verification error:', error); // Log any error in token verification
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = verifyToken;
