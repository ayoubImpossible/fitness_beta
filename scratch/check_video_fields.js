const { admin, db } = require('./src/Firebase/firebaseAdmin');

async function check() {
  const snapshot = await db.collectionGroup('videos').limit(10).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Video ID: ${doc.id}`);
    console.log('Fields:', Object.keys(data));
    console.log('Sample Data:', JSON.stringify(data).substring(0, 200));
    console.log('---');
  });
  process.exit(0);
}

check();
