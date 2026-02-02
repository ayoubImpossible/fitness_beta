const { getAllLikedPlansByUid } = require("../models/LikeM");


//Like Plans Controller
const getLikedPlansHandler = async (req, res) => {
  const { uid } = req.params;  // Get the UID from the request parameters

  try {
    const likedPlans = await getAllLikedPlansByUid(uid); // Fetch liked plans by UID

    if (likedPlans.length > 0) {
      res.status(200).json(likedPlans); // Return the plans as JSON
    } else {
      res.status(404).json({ message: "No liked plans found for this user" });
    }
  } catch (error) {
    console.error("Error in getLikedPlansHandler:", error);
    res.status(500).json({ message: "An error occurred while fetching liked plans." });
  }
};

//Like Exercices Controller
const { getAllLikedExercicesByUid } = require("../models/LikeExercices");
const getLikedExercicesHandler = async (req, res) => {
  const { uid } = req.params;  // Get the UID from the request parameters

  try {
    const likedExercices = await getAllLikedExercicesByUid(uid); // Fetch liked exercices by UID

    if (likedExercices.length > 0) {
      res.status(200).json(likedExercices); // Return the exercices as JSON
    } else {
      res.status(404).json({ message: "No liked exercices found for this user" });
    }
  } catch (error) {
    console.error("Error in getLikedExercicesHandler:", error);
    res.status(500).json({ message: "An error occurred while fetching liked exercices." });
  }
};



module.exports = { getLikedPlansHandler, getLikedExercicesHandler };