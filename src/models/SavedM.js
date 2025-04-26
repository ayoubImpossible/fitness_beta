const { db } = require('../Firebase/firebaseAdmin');
const typesRef = db.collection('types');

// Fetch saved categories for a specific user by UID
const getAllSavedCategoriesByUid = async (uid) => {
  try {
    const savedCategories = [];

    // Loop through all types
    const typesSnapshot = await typesRef.get();

    for (const doc of typesSnapshot.docs) {
      const categoriesRef = doc.ref.collection('categories');
      
      // Fetch categories where the 'savedBy' array contains the uid
      const categoriesSnapshot = await categoriesRef.where('savedBy', 'array-contains', uid).get();

      categoriesSnapshot.forEach(catDoc => {
        savedCategories.push({ id: catDoc.id, ...catDoc.data() });
      });
    }

    return savedCategories;
  } catch (error) {
    console.error("Error fetching saved categories for UID:", error);
    return [];
  }
};

module.exports = { getAllSavedCategoriesByUid };
