const { db, admin } = require('../Firebase/firebaseAdmin');
const exerciseRef = (categoryId) => db.collection('categories').doc(categoryId).collection('exercises');
const categoriesRef = (typeId) => db.collection('types').doc(typeId).collection('categories');

// Get all exercises for a category
const getAllExercisesIn = async (typeId,categoryId) => {
  const snapshot = await categoriesRef(typeId).doc(categoryId).collection('exercises').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get an exercise by ID old
const getExerciseById = async (typeId,categoryId, exerciseId) => {
  const doc = await categoriesRef(typeId).doc(categoryId).collection('exercises').doc(exerciseId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Get an exercise by ID new
const getExerciseByIdinType = async (typeId,categoryId, exerciseId) => {
  const doc = await categoriesRef(typeId).
  doc(categoryId).collection('exercises').doc(exerciseId).get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Add a new exercise
const addExerciseToCategory = async (typeId,categoryId, exerciseData) => {
  const typeRef = db.collection('types').doc(typeId);
  const categoryRef = typeRef.collection('categories').doc(categoryId);
  const exercisesRef = categoryRef.collection('exercises');
  // Add a new document in the exercises subcollection
  const exerciseDoc = await exercisesRef.add(exerciseData);
  
  return exerciseDoc.id; // Return the new exercise's ID
};




// Function to update an exercise in a specific category
const updateExerciseInCategory = async (typeId,categoryId, exerciseId, updatedData) => {
  const exerciseRef = db.collection('types')
                        .doc(typeId)
                        .collection('categories')
                        .doc(categoryId)
                        .collection('exercises')
                        .doc(exerciseId);

  await exerciseRef.update(updatedData);
};

// Function to get an exercise by ID
const getExerciseByid = async (categoryId, exerciseId) => {
  const exerciseRef = db.collection('categories')
                        .doc(categoryId)
                        .collection('exercises')
                        .doc(exerciseId);
  const doc = await exerciseRef.get();
  return doc.exists ? doc.data() : null;
};

// Supprime un exercice par ID
const deleteExerciseFromDatabase = async (typeId,categoryId,exerciseId) => {
  await  db.collection('types')
  .doc(typeId)
  .collection('categories')
  .doc(categoryId).
  collection('exercises').doc(exerciseId).
  delete();
};


//YOU HAVE COMPLETE THIS AYOUB!!!!!!!!!!!!!!!!
const getAllMobilityExercice = async () => {
  try {
    const typesRef = db.collection('categories'); // Reference to the 'types' collection
    const typesSnapshot = await typesRef.get(); // Fetch all documents from 'types'
    const allCategories = []; // Initialize an array to store categories

    // Loop through each document in the 'types' collection
    for (const doc of typesSnapshot.docs) {
      // Reference to the 'categories' subcollection for each document
      const categoriesRef = doc.ref.collection('exercices');
      const categoriesSnapshot = await categoriesRef.get(); // Fetch the categories subcollection

      // Loop through the categories and push them to the array
      categoriesSnapshot.forEach(catDoc => {
        allCategories.push({id: catDoc.id, ...catDoc.data()}); // Add category data to the list
      });
    }

    // Return the array of all categories as a JSON
    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error); // Log any errors
    return []; // Return an empty array in case of error
  }
    }




// Search exercises by name
/*const searchExercises = async (categoryId, query) => {
  const snapshot = await exerciseRef(categoryId).where('name', '>=', query).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};*/

module.exports = 
               { getAllExercisesIn, getExerciseById,
               addExerciseToCategory, updateExerciseInCategory,
               getExerciseByid, deleteExerciseFromDatabase,getExerciseByIdinType };
