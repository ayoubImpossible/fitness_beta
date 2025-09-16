const { db,bucket, admin  } = require('../Firebase/firebaseAdmin');

const PlansRef = db.collection('plans');
const WorkoutRef = db.collection('workouts');
const PrepareWorkoutRef = db.collection('PrepareWorkouts');


const getWorkoutsInPlan = async (userId, planId) => {
    try {
      const planDoc = await PlansRef.doc(planId).get();
        if (!planDoc.exists) {
        throw new Error(`Plan with ID ${planId} does not exist.`);
      }
      const planData = planDoc.data();
      if (planData.userId !== userId) {
        throw new Error("Unauthorized access to the plan.");
      }
        return planData.workouts || [];
    } catch (error) {
      console.error("Error fetching workouts:", error);
      throw error; 
    }
  };


  const addWorkoutToDB = async (workoutData) => {
    const workoutCollection = db.collection('workouts'); 
    const workoutDoc = await workoutCollection.add({
      ...workoutData,
    });
  
    return { id: workoutDoc.id, ...workoutData };
  };
  

  const getAllWorkouts = async (userId) => {
    try {
      const snapshot = await WorkoutRef.where("userId", "==", userId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching workout:", error);
      throw error; 
    }
  };
  


  const getWorkoutByIdAndUser = async (userId, workoutId) => {
    try {
      const workoutDoc = await WorkoutRef.doc(workoutId).get();
      if (!workoutDoc.exists) {
        throw new Error(`Workout with ID ${workoutId} not found.`);
      }
      const workoutData = workoutDoc.data();
      if (workoutData.userId !== userId) {
        throw new Error("Unauthorized access to this workout.");
      }
      return workoutData.workouts || [];
    } catch (error) {
      console.error("Error fetching workout by ID and user:", error);
      throw error;
    }
  };
  

  const addPrepareWorkoutToDB = async (workoutData) => {
    try{
      const prepareworkoutCollection = db.collection('PrepareWorkouts'); 
      const workoutDoc = await prepareworkoutCollection.add({
        ...workoutData,
      });    
      return { id: workoutDoc.id, ...workoutData };
    } catch (error) {
      console.error("Error fetching Prepareworkout ", error);
      throw error;
    
    }
   
  };
  
  const getPrepareWorkoutByTypeInDB = async (type) => {
    try {
      const snapshot = await PrepareWorkoutRef.where("Type", "==", type).get(); 
      if (snapshot.empty) {
        console.log(`No workouts found for type: ${type}`);
        return [];
      }
      let filteredWorkouts = [];
      snapshot.forEach((doc) => {
        filteredWorkouts.push({ id: doc.id, ...doc.data() });
      });
      return filteredWorkouts;
    } catch (error) {
      console.error("Error fetching workouts by type:", error);
      return [];
    }
  };



const deleteWorkout = async (workoutId) => {
  try {
    const workoutDocRef = WorkoutRef.doc(workoutId);
    const docSnapshot = await workoutDocRef.get();
    if (!docSnapshot.exists) {
      throw new Error("Workout not found");
    }
    await workoutDocRef.delete();

    return { success: true, message: "Workout deleted successfully." };
  } catch (error) {
    console.error("Error deleting Workout:", error);
    throw error;
  }
};
  // 🔹 Update workout inside a plan (plans/{planId})
const updateWorkoutInPlan = async (planId, videoUrl, data) => {
  if (!planId || !videoUrl || data.serieNumber == null || data.repetition == null) {
    throw new Error("planId, videoUrl, serieNumber, and repetition are required");
  }

  const planDocRef = PlansRef.doc(planId);
  const planDoc = await planDocRef.get();

  if (!planDoc.exists) {
    throw new Error(`Plan with ID ${planId} not found`);
  }

  const planData = planDoc.data();
  const workouts = planData.workouts || [];

  let videoFound = null;

  // Loop through workouts array
  for (let i = 0; i < workouts.length; i++) {
    const workout = workouts[i];
    if (!workout.videos || !Array.isArray(workout.videos)) continue;

    const videoIndex = workout.videos.findIndex(v => v.videoUrl === videoUrl);
    if (videoIndex !== -1) {
      // Update the specific video
      workout.videos[videoIndex] = {
        ...workout.videos[videoIndex],
        serieNumber: data.serieNumber,
        repetition: data.repetition,
        updatedAt: new Date().toISOString(),
      };
      videoFound = workout.videos[videoIndex];
      break;
    }
  }

  if (!videoFound) {
    throw new Error(`Video with URL ${videoUrl} not found in plan`);
  }

  await planDocRef.update({ workouts });

  return videoFound;
};



// 🔹 Update workout in workouts/{videoId}
const UpdateSerieRepetition = async (videoId, data) => {
  if (!videoId || data.serieNumber == null || data.repetition == null) {
    throw new Error("videoId, serieNumber, and repetition are required");
  }

  const workoutDocRef = WorkoutRef.doc(videoId);
  const workoutDoc = await workoutDocRef.get();

  if (!workoutDoc.exists) {
    throw new Error(`Workout with ID ${videoId} not found`);
  }

  // 🔹 Add or update fields in document
  await workoutDocRef.update({
    serieNumber: data.serieNumber,
    repetition: data.repetition,
    updatedAt: new Date().toISOString(),
  });

  const updatedDoc = await workoutDocRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};



  
module.exports = {
    getWorkoutsInPlan,
    addWorkoutToDB,
    getAllWorkouts,
    getWorkoutByIdAndUser,
    addPrepareWorkoutToDB,
    getPrepareWorkoutByTypeInDB,
    deleteWorkout,
    updateWorkoutInPlan,
    UpdateSerieRepetition
};
