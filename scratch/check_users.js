const { db, auth } = require('./src/Firebase/firebaseAdmin');

async function check() {
  try {
    console.log('--- Checking Firestore "users" collection ---');
    const snapshot = await db.collection('users').get();
    console.log(`Found ${snapshot.size} documents in "users" collection.`);
    snapshot.docs.forEach(doc => {
      console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });

    console.log('\n--- Checking Firebase Auth ---');
    const listUsersResult = await auth.listUsers(10);
    console.log(`Found ${listUsersResult.users.length} users in Auth (first 10).`);
    listUsersResult.users.forEach(user => {
      console.log(`UID: ${user.uid}, Email: ${user.email}`);
    });
  } catch (error) {
    console.error('Error during check:', error);
  }
}

check();
