const { getWorkoutsInPlan, addWorkoutToDB, getAllWorkouts, getWorkoutByIdAndUser, addPrepareWorkoutToDB, getPrepareWorkoutByTypeInDB, deleteWorkout } = require("../models/workout");
const { db } = require("../Firebase/firebaseAdmin");
const { uploadVideoToStorage, uploadImage } = require("../Utils/Helpers");
const { addPrepareExercice, getPrepareExercicesByPosition, addVideoToPrepareExercice, getVideosForPrepareExercice, getPrepareExerciceById } = require("../models/prepareExercice");
const PlansRef = db.collection("plans");



const getAllWorkoutInPlanHandler=async(req,res)=>{
    const { userId,planId } = req.params;

    try {
      const workouts = await getWorkoutsInPlan(userId,planId);
      res.status(200).json(workouts);
    } catch (error) {
      console.error("Error fetching workout data:", error);
      res.status(404).json({ error: error.message });
    }
}
const addWorkoutsToPlanHandler = async (req, res) => {
  const { planId } = req.params;
  const { workouts } = req.body;
  

  if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
    return res.status(400).json({ message: "Workouts list is required and must be an array." });
  }

  try {
    const planDoc = await PlansRef.doc(planId).get();

    if (!planDoc.exists) {
      console.error(`🚨 Plan with ID ${planId} not found.`);
      return res.status(404).json({ message: `Plan with ID ${planId} not found.` });
    }
    
    const existingWorkouts = planDoc.data().workouts || [];
    const updatedWorkouts = [...existingWorkouts, ...workouts];

    await PlansRef.doc(planId).update({ workouts: updatedWorkouts });

    return res.status(200).json({ message: "Workouts added successfully.", workouts: updatedWorkouts });
  } catch (error) {
    console.error("🚨 Server Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
const addWorkoutHandler = async (req, res) => {
  const { workouts,name } = req.body; // Destructure from the request body
  const { userId } = req.params;

  try {

    const newWorkout = {
      workouts,  // Pass the array of selected workouts
      userId,  // Ensure userId is set correctly
      name,
      createdAt: new Date().toISOString(),
    };

    const savedWorkout = await addWorkoutToDB( newWorkout);  // Pass the correct data structure
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error("Error adding workout:", error.message);
    res.status(500).json({ error: error.message });
  }
};
const addPrepareWorkoutHandler = async (req, res) => {
  const {Type,titre,description}=req.body;
  try {
    if (
      !Type ||
      !titre ||
      !description ||
      !req.files.video ||
      !req.files.image
    ) {
      return res.status(400).json({ message: "Please provide all required fields including video and image." });
    }

    // Upload video and image
    const videoUrl = await uploadVideoToStorage(req.files.video[0]);
    const imageUrl = await uploadImage(req.files.image[0]);


    const newWorkout = {
      Type,  // Pass the array of selected workouts
      titre,  // Ensure userId is set correctly
      description,
      videoUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const savedWorkout = await addPrepareWorkoutToDB( newWorkout);  // Pass the correct data structure
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error("Error adding workout:", error.message);
    res.status(500).json({ error: error.message });
  }
};
const getPrepareWorkoutsHandler=async(req,res)=>{
  const {type}=req.params
  try{

     const ResponcePrepareWorkouts=await getPrepareWorkoutByTypeInDB(type);
     res.status(200).json(ResponcePrepareWorkouts)
  }catch(error){
    console.error('error finding PrepareWorkout By Type !')
  }
}
// Get Type
const getWorkoutHandler = async (req, res) => {
  const { userId } = req.params;
  try {
    const workoutData = await getAllWorkouts(userId);
    res.status(200).json(workoutData);
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(404).json({ error: error.message });
  }
};
const getWorkoutByIdAndUserHandler = async (req, res) => {
  const { userId, workoutId } = req.params;

  try {
    const workouts = await getWorkoutByIdAndUser(userId, workoutId);
    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error fetching workout:", error);
    res.status(404).json({ error: error.message });
  }
};
//Add New PrepareExercice 
const addPrepareExerciceHandler = async (req, res) => {
  const { Title,Description,position} = req.body;
  const file = req.files;
  try {
    let imageUrl = null;
    if (file) {
       imageUrl = await uploadImage(req.files.image[0]);
    }
    const PrepareExerciceData = {
      Title,
      Description,
      position,
      imageUrl,
    }
    const newData = await addPrepareExercice(PrepareExerciceData);
    res.status(201).json(newData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addVideoToPrepareExerciceHandler = async (req, res) => {
  const { exerciceId } = req.params;
  const { titre, description } = req.body;
  const videoFile = req.files?.video?.[0];
  const imageFile = req.files?.image?.[0];

  if (!titre || !description || !videoFile || !imageFile) {
    return res.status(400).json({ message: "Titre, desc, video, and image are required." });
  }

  try {
    // Upload video and image
    const videoUrl = await uploadVideoToStorage(videoFile);
    const imageUrl = await uploadImage(imageFile);

    const newVideo = { titre, description, videoUrl, imageUrl };
    const response = await addVideoToPrepareExercice(exerciceId, newVideo);

    res.status(201).json(response);
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get PrepareExercices filtered by position
const getPrepareExercicesByPositionHandler = async (req, res) => {
  const { position } = req.query; // Get position from query parameters

  if (!position) {
    return res.status(400).json({ message: "Position parameter is required." });
  }

  try {
    const exercices = await getPrepareExercicesByPosition(position);
    if (exercices.length === 0) {
      return res.status(404).json({ message: "No exercises found for this position" });
    }
    res.status(200).json(exercices);
  } catch (error) {
    console.error("Error fetching PrepareExercices by position:", error);
    res.status(500).json({ error: error.message });
  }
};
const getVideosForPrepareExerciceHandler = async (req, res) => {
  const { exerciceId } = req.params;

  try {
    const videos = await getVideosForPrepareExercice(exerciceId);
    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: error.message });
  }
};


const getPrepareExerciceHandler = async (req, res) => {
  const { exerciceId } = req.params;
  try {
    const data = await getPrepareExerciceById(exerciceId);
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching Prepare Exercice By Id:", error);
    res.status(500).json({ error: error.message });
  }
};



const deleteWorkoutByIdHandler = async (req, res) => {
  try {
    const { id } = req.params; // Get plan ID from URL param

    if (!id) {
      return res.status(400).json({ error: "Workout ID is required." });
    }

    const result = await deleteWorkout(id); // Call service function
    res.status(200).json(result); // Return success response
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ error: error.message });
  }
};



module.exports={getAllWorkoutInPlanHandler,
                addWorkoutsToPlanHandler,
                addWorkoutHandler,
                getWorkoutHandler,
                getWorkoutByIdAndUserHandler,
                addPrepareWorkoutHandler,
                getPrepareWorkoutsHandler,
                addPrepareExerciceHandler,
                addVideoToPrepareExerciceHandler,
                getPrepareExercicesByPositionHandler,
                getVideosForPrepareExerciceHandler,
                getPrepareExerciceHandler,
                deleteWorkoutByIdHandler
              }