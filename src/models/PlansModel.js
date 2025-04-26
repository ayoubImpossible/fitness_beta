const { db, admin  } = require('../Firebase/firebaseAdmin');

const PlansRef = db.collection('plans');

const addPlanToDB = async (userId, planData) => {
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


const deletePlanById = async (planId) => {
  try {
    // Reference the specific plan document
    const planDocRef = PlansRef.doc(planId);

    // Check if the plan exists
    const docSnapshot = await planDocRef.get();
    if (!docSnapshot.exists) {
      throw new Error("Plan not found");
    }

    // Delete the plan
    await planDocRef.delete();

    return { success: true, message: "Plan deleted successfully." };
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
};


const getAllPlans = async (userId) => {
  try {
    // Query Firestore for plans where userId matches
    const snapshot = await PlansRef.where("userId", "==", userId).get();
    
    // Map the documents to an array
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error; // Propagate error to handle it elsewhere
  }
};


module.exports = {
  addPlanToDB,
  getAllPlans
  ,deletePlanById
};
