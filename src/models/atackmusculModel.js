const { db, admin } = require('../Firebase/firebaseAdmin');
/*const atackRef = (exerciceId) => db.collection('categories').doc(exerciceId).collection('exercises').
doc(exerciceId).collection('atack');*/
const categoriesRef = (typeId) => db.collection('types').doc(typeId).collection('categories');



const getAllAtacks = async (typeId,categoryId,exerciceId) => {
  const snapshot = await categoriesRef(typeId).doc(categoryId).
  collection('exercises').doc(exerciceId).collection('atack').get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};




const getAllAtacks_2 = async () => {
  try {
    const snapshot = await db.collectionGroup('atack').get(); // Fetch all atacks from all exercises
    const atacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return atacks;
  } catch (error) {
    console.error("Error fetching all atacks:", error);
    throw new Error("Failed to retrieve atacks");
  }
};





// Get an exercise by ID old
const getAtackById = async (typeId,categoryId, exerciseId,atackId) => {
  const doc = await categoriesRef(typeId).doc(categoryId).
  collection('exercises').doc(exerciseId).collection('atack').doc(atackId).get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};
// Add a new exercise
const addAtack_To_Exercice= async (typeId,categoryId,exerciceId, atackData) => {
  const typeRef = db.collection('types').doc(typeId);
  const categoryRef = typeRef.collection('categories').doc(categoryId);
  const atackRef = categoryRef.collection('exercises').doc(exerciceId).
  collection('atack') ;
  // Add a new document in the exercises subcollection
  const atackDoc = await atackRef.add(atackData);
  
  return atackDoc.id; // Return the new exercise's ID
};
// Function to update an exercise in a specific category
const update_Atack_In_Exercice = async (typeId,categoryId, exerciseId,atackId, updatedData) => {
  const atackRef = db.collection('types')
                        .doc(typeId)
                        .collection('categories')
                        .doc(categoryId)
                        .collection('exercises')
                        .doc(exerciseId).
                        collection('atack').
                        doc(atackId);

  await atackRef.update(updatedData);
};
// Supprime un exercice par ID
const delete_Atack_From_Database = async (typeId,categoryId,exerciseId,atackId) => {
  await  db.collection('types')
  .doc(typeId)
  .collection('categories')
  .doc(categoryId).
  collection('exercises')
  .doc(exerciseId)
  .collection('atack')
  .doc(atackId).
  delete();
};


const getVideosByMuscleAttack = async (muscleAttack) => {
  try {
    const typesSnapshot = await db.collection('types').get(); // Fetch all types
    let allVideos = [];

    const typePromises = typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      const categoryPromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        const exercisePromises = exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const atackSnapshot = await exerciseDoc.ref.collection('atack')
            .where('muscleAttack', '==', muscleAttack) // Filter by muscleAttack
            .get();

          const atackPromises = atackSnapshot.docs.map(async (atackDoc) => {
            const levelSnapshot = await atackDoc.ref.collection('levels').get();

            const videoPromises = levelSnapshot.docs.map(async (levelDoc) => {
              const videoSnapshot = await levelDoc.ref.collection('videos').get();
              
              return videoSnapshot.docs.map((videoDoc) => ({
                id: videoDoc.id,
                ...videoDoc.data()
              }));
            });

            // Collect all videos from this atack and push them to allVideos
            const videos = await Promise.all(videoPromises);
            allVideos.push(...videos.flat()); // Flatten and push to allVideos
          });

          return await Promise.all(atackPromises);
        });

        return (await Promise.all(exercisePromises)).flat();
      });

      return (await Promise.all(categoryPromises)).flat();
    });

    await Promise.all(typePromises); // Ensure all promises resolve
    return allVideos; // Return the list of all videos
  } catch (error) {
    console.error('Error fetching videos by muscleAttack:', error);
    return [];
  }
};



// Search exercises by name
/*const searchExercises = async (categoryId, query) => {
  const snapshot = await exerciseRef(categoryId).where('name', '>=', query).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};*/

module.exports = 
               { 
                getAllAtacks,
                getAtackById,
                addAtack_To_Exercice,
                update_Atack_In_Exercice,
                delete_Atack_From_Database,
                getAllAtacks_2,
                getVideosByMuscleAttack
            };
