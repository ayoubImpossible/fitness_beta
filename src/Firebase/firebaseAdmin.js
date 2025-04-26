const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK with Firestore, Auth, and Storage
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`, // Add the storageBucket for Firebase Storage
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket(); // Initialize Firebase Storage

module.exports = { db, auth, bucket,admin }; // Export the bucket for use