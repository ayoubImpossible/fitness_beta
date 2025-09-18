const { getWorkoutsInPlan, addWorkoutToDB, getAllWorkouts,
        getWorkoutByIdAndUser, addPrepareWorkoutToDB, getPrepareWorkoutByTypeInDB,
        deleteWorkout, 
        updateWorkoutInPlan,
        UpdateSerieRepetition} =
        require("../models/workout");

const { db } = require("../Firebase/firebaseAdmin");
const { uploadVideoToStorage, uploadImage } =
        require("../Utils/Helpers");

const { addPrepareExercice, getPrepareExercicesByPosition, 
        addVideoToPrepareExercice, getVideosForPrepareExercice, 
        getPrepareExerciceById } = 
        require("../models/prepareExercice");

const PlansRef = db.collection("plans");
const WorkoutRef = db.collection("workouts");


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
    console.error("Server Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


const addWorkoutHandler = async (req, res) => {
  const { workouts,name } = req.body; 
  const { userId } = req.params;
  try {
    const newWorkout = {
      workouts,  
      userId,  
      name,
      createdAt: new Date().toISOString(),
    };
    const savedWorkout = await addWorkoutToDB( newWorkout);  
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
    const videoUrl = await uploadVideoToStorage(req.files.video[0]);
    const imageUrl = await uploadImage(req.files.image[0]);
    const newWorkout = {
      Type, 
      titre, 
      description,
      videoUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const savedWorkout = await addPrepareWorkoutToDB( newWorkout);  
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


const getPrepareExercicesByPositionHandler = async (req, res) => {
  const { position } = req.query; 
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
    const { id } = req.params; 
    if (!id) {
      return res.status(400).json({ error: "Workout ID is required." });
    }
    const result = await deleteWorkout(id); 
    res.status(200).json(result); 
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ error: error.message });
  }
};






const UpdateSerieRepetitionHandler = async (req, res) => {
  const { workoutId } = req.params;   // Workout document ID
  const { videoUrl, serieNumber, repetition } = req.body;

  if (!workoutId || !videoUrl || serieNumber == null || repetition == null) {
    return res.status(400).json({ error: "workoutId, videoUrl, serieNumber, repetition are required" });
  }

  try {
    const workoutDocRef = WorkoutRef.doc(workoutId);
    const workoutDoc = await workoutDocRef.get();

    if (!workoutDoc.exists) {
      return res.status(404).json({ error: "Workout not found" });
    }

    const workoutData = workoutDoc.data();
    const exercises = workoutData.workouts || []; // 👈 correct array from DB

    let updated = false;
    for (let i = 0; i < exercises.length; i++) {
      if (exercises[i].videoUrl === videoUrl) {  // 👈 match by videoUrl
        exercises[i].serieNumber = parseInt(serieNumber);
        exercises[i].repetition = parseInt(repetition);
        exercises[i].updatedAt = new Date().toISOString();
        updated = true;
        break;
      }
    }

    if (!updated) {
      return res.status(404).json({ error: "Exercise with this videoUrl not found" });
    }

    await workoutDocRef.update({ workouts: exercises }); // 👈 save back workouts array

    res.status(200).json({ message: "Exercise updated successfully" });
  } catch (error) {
    console.error("Error updating workout:", error);
    res.status(500).json({ error: error.message });
  }
};




const UpdateSerieRepetitionPlanHandler = async (req, res) => {
  const { planId } = req.params;
  const { videoUrl, serieNumber, repetition } = req.body;

  if (!planId || !videoUrl || serieNumber == null || repetition == null) {
    return res.status(400).json({ error: "planId, videoUrl, serieNumber, and repetition are required" });
  }

  try {
    const planDocRef = PlansRef.doc(planId);
    const planDoc = await planDocRef.get();
    
    if (!planDoc.exists) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const planData = planDoc.data();
    const workouts = planData.workouts || [];
    
    // Find workout by videoUrl and update
    let updated = false;
    for (let i = 0; i < workouts.length; i++) {
      if (workouts[i].videoUrl === videoUrl) {
        workouts[i].serieNumber = parseInt(serieNumber);
        workouts[i].repetition = parseInt(repetition);
        workouts[i].updatedAt = new Date().toISOString();
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      return res.status(404).json({ error: "Workout not found in plan" });
    }
    
    // Save updated workouts back to plan
    await planDocRef.update({ workouts });
    
    res.status(200).json({ message: "Updated successfully" });
    
  } catch (error) {
    console.error("Error:", error);
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
                deleteWorkoutByIdHandler,
                UpdateSerieRepetitionHandler,
                UpdateSerieRepetitionPlanHandler
              }