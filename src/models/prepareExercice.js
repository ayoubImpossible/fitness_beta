const { db } = require("../Firebase/firebaseAdmin");


const PreparerExercice=db.collection('PreparerExercices')

// Add Type
const addPrepareExercice = async (Data) => {
    const ExercicePreparerDoc = await PreparerExercice.add(Data);
    return { id: ExercicePreparerDoc.id, ...Data };
  };


  // Get PrepareExercices by position
const getPrepareExercicesByPosition = async (position) => {
  try {
    let query = PreparerExercice.where("position", "==", position);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error("Error fetching PrepareExercices: " + error.message);
  }
};


const addVideoToPrepareExercice = async (exerciceId, videoData) => {
  try {
    const exerciceRef = PreparerExercice.doc(exerciceId);
    const videoRef = exerciceRef.collection("videos").doc();

    await videoRef.set({
      titre: videoData.titre,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      imageUrl:videoData.imageUrl,
      createdAt: new Date().toISOString(),
    });

    return { id: videoRef.id, ...videoData };
  } catch (error) {
    throw new Error("Error adding video: " + error.message);
  }
};


const getVideosForPrepareExercice = async (exerciceId) => {
  try {
    const videosRef = PreparerExercice.doc(exerciceId).collection("videos");
    const snapshot = await videosRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error("Error fetching videos: " + error.message);
  }
};


const getPrepareExerciceById=async(exerciceId)=>{
  try {
    const exerciceRef = PreparerExercice.doc(exerciceId);
    const exerciceSnap = await exerciceRef.get();

    if (!exerciceSnap.exists) {
        return null;
    }
    
    return { id: exerciceSnap.id, ...exerciceSnap.data() };
} catch (error) {
    console.error('Error fetching prepareExercice:', error);
    throw error;
}
}



module.exports={
  addPrepareExercice,
  getPrepareExercicesByPosition,
  addVideoToPrepareExercice,
  getVideosForPrepareExercice,
  getPrepareExerciceById}