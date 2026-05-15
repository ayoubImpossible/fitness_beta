const { db } = require('../Firebase/firebaseAdmin');

/**
 * Single collectionGroup query = 1 read regardless of how many types exist.
 * Requires 'savedBy' field to have Collection group scope enabled in
 * Firebase Console → Firestore → Indexes → Single field → categories → savedBy
 */
const getAllSavedCategoriesByUid = async (uid) => {
  try {
    const snapshot = await db
      .collectionGroup('categories')
      .where('savedBy', 'array-contains', uid)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching saved categories for UID:', error);
    return [];
  }
};

module.exports = { getAllSavedCategoriesByUid };
