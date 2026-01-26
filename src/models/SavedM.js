const { db } = require('../Firebase/firebaseAdmin');
const typesRef = db.collection('types');


const getAllSavedCategoriesByUid = async (uid) => {
  
  try {

    const savedCategories = [];

    const typesSnapshot = await typesRef.get();

    for (const doc of typesSnapshot.docs) {

      const categoriesRef = doc.ref.collection('categories');

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
