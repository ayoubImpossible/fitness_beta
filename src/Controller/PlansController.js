const { addPlanToDB, getAllPlans, deletePlanById } = require("../models/PlansModel");


const addPlanHandler = async (req, res) => {
  const { name, workouts } = req.body; // Destructure from the request body
  const { userId } = req.params;

  try {
    if (!name || !workouts || !Array.isArray(workouts) || workouts.length === 0) {
      return res.status(400).json({ message: "Please provide a valid plan name and at least one workout." });
    }

    const newPlan = {
      name,  // Use 'name' instead of planName
      workouts,  // Pass the array of selected workouts
      userId,  // Ensure userId is set correctly
      createdAt: new Date().toISOString(),
    };

    const savedPlan = await addPlanToDB(userId, newPlan);  // Pass the correct data structure
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error("Error adding plan:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Type
const getPlansHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const plansData = await getAllPlans(userId);
    res.status(200).json(plansData);
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(404).json({ error: error.message });
  }
};



const deletePlanByIdHandler = async (req, res) => {
  try {
    const { id } = req.params; // Get plan ID from URL param

    if (!id) {
      return res.status(400).json({ error: "Plan ID is required." });
    }

    const result = await deletePlanById(id); // Call service function
    res.status(200).json(result); // Return success response
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ error: error.message });
  }
};



  module.exports={
    addPlanHandler,
    getPlansHandler,
    deletePlanByIdHandler
  }