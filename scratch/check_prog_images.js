const { admin, db } = require('./src/Firebase/firebaseAdmin');

async function check() {
  const snapshot = await db.collection('construire').limit(5).get();
  snapshot.forEach(doc => {
    console.log(`Program: ${doc.data().name}`);
    console.log('Fields:', Object.keys(doc.data()));
    // Look for anything that looks like a URL
    Object.entries(doc.data()).forEach(([k, v]) => {
      if (typeof v === 'string' && v.startsWith('http')) {
        console.log(`Potential Image Field: ${k} = ${v}`);
      }
    });
    console.log('---');
  });
  process.exit(0);
}

check();
