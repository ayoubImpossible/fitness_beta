const { db } = require('../Firebase/firebaseAdmin');


const getAllLikedPlansByUid = async (uid) => {
  try {
    
    const likedPlans = [];
    
    const planSnapshot = await db.collection('construire')
      .where('savedBy', 'array-contains', uid)
      .get();
    
    planSnapshot.forEach(planDoc => {
      likedPlans.push({
        id: planDoc.id, 
        ...planDoc.data() 
      });
    });
    
    return likedPlans;
  } catch (error) {
    console.error("Error fetching saved plans for UID:", error);
    return [];
  }
};


module.exports = { getAllLikedPlansByUid };