const { db,bucket, admin  } = require('../Firebase/firebaseAdmin');

const PlansRef = db.collection('plans');
const WorkoutRef = db.collection('workouts');
const PrepareWorkoutRef = db.collection('PrepareWorkouts');

/*const addPlanToDB = async (userId, planData) => {
  const plansCollection = db.collection('plans'); // Replace with your DB schema
  const planDoc = await plansCollection.add({
    ...planData,
    userId,
  });

  // Add a notification for the created plan
  const notificationRef = db.collection('notifications');
  await notificationRef.add({
    message: `A new plan "${planData.name}" has been created.`,
    planId: planDoc.id,
    type: 'plan',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false,
  });

  return { id: planDoc.id, ...planData };
};
*/
const getWorkoutsInPlan = async (userId, planId) => {
    try {
      // Fetch the specific plan by its ID
      const planDoc = await PlansRef.doc(planId).get();
  
      // Check if the plan exists
      if (!planDoc.exists) {
        throw new Error(`Plan with ID ${planId} does not exist.`);
      }
  
      const planData = planDoc.data();
  
      // Ensure the plan belongs to the specified user
      if (planData.userId !== userId) {
        throw new Error("Unauthorized access to the plan.");
      }
  
      // Return the workouts array (or an empty array if undefined)
      return planData.workouts || [];
    } catch (error) {
      console.error("Error fetching workouts:", error);
      throw error; // Propagate the error to handle it elsewhere
    }
  };


  const addWorkoutToDB = async (workoutData) => {
    const workoutCollection = db.collection('workouts'); // Replace with your DB schema
    const workoutDoc = await workoutCollection.add({
      ...workoutData,
    });
  
    // Add a notification for the created plan
    const notificationRef = db.collection('notifications');
    await notificationRef.add({
      message: `A new workout "${workoutData.name}" has been created.`,
      planId: workoutDoc.id,
      type: 'workout',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false,
    });
  
    return { id: workoutDoc.id, ...workoutData };
  };
  

  const getAllWorkouts = async (userId) => {
    try {
      // Query Firestore for plans where userId matches
      const snapshot = await WorkoutRef.where("userId", "==", userId).get();
      
      // Map the documents to an array
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching workout:", error);
      throw error; // Propagate error to handle it elsewhere
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
      const prepareworkoutCollection = db.collection('PrepareWorkouts'); // Replace with your DB schema
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
      const snapshot = await PrepareWorkoutRef.where("Type", "==", type).get(); // Query workouts by type
  
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
    // Reference the specific plan document
    const workoutDocRef = WorkoutRef.doc(workoutId);

    // Check if the plan exists
    const docSnapshot = await workoutDocRef.get();
    if (!docSnapshot.exists) {
      throw new Error("Workout not found");
    }

    // Delete the plan
    await workoutDocRef.delete();

    return { success: true, message: "Workout deleted successfully." };
  } catch (error) {
    console.error("Error deleting Workout:", error);
    throw error;
  }
};
  
  
module.exports = {
    getWorkoutsInPlan,
    addWorkoutToDB,
    getAllWorkouts,
    getWorkoutByIdAndUser,
    addPrepareWorkoutToDB,
    getPrepareWorkoutByTypeInDB,
    deleteWorkout
};
