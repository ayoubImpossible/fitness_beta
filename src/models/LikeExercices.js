const { db } = require('../Firebase/firebaseAdmin');


const getAllLikedExercicesByUid = async (uid) => {
  try {
    
    const likedExercices = [];
    
    const planSnapshot = await db.collection('PreparerExercices')
      .where('savedBy', 'array-contains', uid)
      .get();
    
    planSnapshot.forEach(exerciceDoc => {
      likedExercices.push({
        id: exerciceDoc.id, 
        ...exerciceDoc.data() 
      });
    });
    
    return likedExercices;
  } catch (error) {
    console.error("Error fetching saved exercices for UID:", error);
    return [];
  }
};


module.exports = { getAllLikedExercicesByUid };