const {
  addVideoToLevel,
  updateVideoInLevel,
  getAllVideosInLevel,
  getVideoById,
  getAllLevelsInExercise ,
  addLevelToExercise,
  getAllVideosInExercice,
  getVideoCollectionInExercise,
  getAllVideosByL,
  getAllVideosByDifficulty
} = require('../models/levelModel');

const { uploadVideoToStorage, deleteVideoFromStorage, uploadImage } = require('../Utils/Helpers');
const { db } = require('../Firebase/firebaseAdmin');


// Add a video to a level
const addVideoHandler = async (req, res) => {
 
  const { name, description, difficulty, duration, category,equipment } = req.body;
  const file = req.file;
  const { typeId,categoryId, exerciseId, levelId ,atackId} = req.params;

  try {
    
  if (!name || !description || !difficulty || !duration || !category ||!equipment|| !file) {
    return res.status(400).json({ message: 'Please provide all required fields including video' });

  }
  const videoUrl = await uploadVideoToStorage(file);
  const newvideoTolevel = {
    name,
    description,
    difficulty,
    duration,
    category,
    equipment,
    videoUrl,
    categorieId:categoryId,
    exerciceId:exerciseId,
    levelId:levelId,
    typeId:typeId,
    atackId:atackId,
    createdAt: new Date().toISOString(),
  };
    const newVideo = await addVideoToLevel(typeId,categoryId, exerciseId,atackId, levelId, newvideoTolevel);
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addVideoHandler2 = async (req, res) => {
  const { name, description, difficulty, duration, category, equipment } = req.body;
  const { typeId, categoryId, exerciseId, levelId, atackId } = req.params;

  try {
    // Check if all required fields and files are provided
    if (
      !name ||
      !description ||
      !difficulty ||
      !duration ||
      !category ||
      !equipment ||
      !req.files ||
      !req.files.video ||
      !req.files.image
    ) {
      return res.status(400).json({ message: "Please provide all required fields including video and image." });
    }

    // Upload video and image
    const videoUrl = await uploadVideoToStorage(req.files.video[0]);
    const imageUrl = await uploadImage(req.files.image[0]);

    // Create the new video entry
    const newVideoToLevel = {
      name,
      description,
      difficulty,
      duration,
      category,
      equipment,
      videoUrl,
      imageUrl,
      categorieId: categoryId,
      exerciceId: exerciseId,
      levelId: levelId,
      typeId: typeId,
      atackId: atackId,
      createdAt: new Date().toISOString(),
    };

    // Save to the database or desired storage
    const newVideo = await addVideoToLevel(typeId, categoryId, exerciseId, atackId, levelId, newVideoToLevel);

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Error adding video:", error.message);
    res.status(500).json({ error: error.message });
  }
};
// Get all videos in a level
const getAllVideosHandler = async (req, res) => {
  try {
    const { typeId,categoryId, exerciseId,atackId, levelId } = req.params;
    const videos = await getAllVideosInLevel(typeId,categoryId, exerciseId,atackId, levelId);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllVideosInExerciceHandler=async (req,res)=>{
      try{
        const {typeId,categoryId,exerciseId}=req.params;
        const videos=await getVideoCollectionInExercise(typeId,categoryId,exerciseId);
        res.json(videos)
      }catch(error){
        res.status(500).json({error:error.message})
      }
}   
// Get a video by ID in a level
const getVideoByIdHandler = async (req, res) => {
  try {
    const { typeId,categoryId, exerciseId,atackId, levelId, videoId } = req.params;
    const video = await getVideoById(typeId,categoryId, exerciseId,atackId, levelId, videoId);
    res.json(video);
  } catch (error) {
    res.status(404).json({ error: 'Video not found' });
  }
};
const getVideosCollection = (typeId,categoryId, exerciseId,atackId, levelId) => {
  return db
  .collection('types')
  .doc(typeId).collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId).
    collection('atack').
    doc(atackId)
    .collection('levels')
    .doc(levelId)
    .collection('videos');
};
/// Delete Video Handler
const deleteVideoHandler = async (req, res) => {
  try {
    const { typeId,categoryId, exerciseId,atackId, levelId, videoId } = req.params;

    const videoDocRef = getVideosCollection(typeId,categoryId, exerciseId,atackId, levelId).doc(videoId);
    const videoDoc = await videoDocRef.get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const { videoUrl } = videoDoc.data();

    await videoDocRef.delete();
    await deleteVideoFromStorage(videoUrl);

    res.status(204).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update Video Handler
const updateVideoHandler = async (req, res) => {
  try {
    const { typeId,categoryId, exerciseId,atackId ,levelId, videoId } = req.params;
    const { name, description } = req.body;
    const file = req.file; // Assuming multer handles file upload with field name 'file'

    // Reference to the video document in Firestore
    const videoDocRef = getVideosCollection(typeId,categoryId, exerciseId,atackId, levelId).doc(videoId);
    const videoDoc = await videoDocRef.get();

    if (!videoDoc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    let videoUrl = videoDoc.data().videoUrl;

    // Step 1: Replace the video file if a new file is uploaded
    if (file) {
      console.log("New file detected, replacing video...");

      // Delete the old video from storage if it exists
      if (videoUrl) {
        await deleteVideoFromStorage(videoUrl);
        console.log("Old video deleted from storage.");
      }

      // Upload the new video file
      videoUrl = await uploadVideoToStorage(file, 'videos');
      console.log("New video uploaded with URL:", videoUrl);
    } else {
      console.log("No new file uploaded, keeping existing video URL.");
    }

    // Step 2: Prepare updated data
    const updatedData = {
      name: name || videoDoc.data().name, // Only update if new data is provided
      description: description || videoDoc.data().description,
      videoUrl, // Updated URL if the file was replaced, else it remains the same
    };

    // Step 3: Update video metadata in Firestore
    await videoDocRef.update(updatedData);
    console.log("Firestore document updated with:", updatedData);

    res.status(200).json({ message: 'Video updated successfully', videoUrl });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: error.message });
  }
};
// Controller function to get all levels in an exercise
const getAllLevelsHandler = async (req, res) => {

  try {
  
    const {typeId, categoryId, exerciseId,atackId } = req.params;
    const levels = await getAllLevelsInExercise(typeId,categoryId, exerciseId,atackId);


  if (levels.length === 0) {
      return res.status(404).json({ message: 'No levels found for this exercise' });
  }

    res.status(200).json({ levels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Controller function to add a level to an exercise
const addLevelHandler = async (req, res) => {
  try {
    const { typeId,categoryId, exerciseId,atackId } = req.params;
    const { name, description, videoCount } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    // Fetch exercise name from Firestore
    const exerciseRef = db
      .collection('types')
      .doc(typeId)
      .collection('categories')
      .doc(categoryId).collection('exercises').doc(exerciseId);

    const exerciseDoc = await exerciseRef.get();
    if (!exerciseDoc.exists) {
      return res.status(404).json({ error: 'Exercise not found.' });
    }

    const exerciseName = exerciseDoc.data().name; // Get the name from the exercise data

    const newLevel = {
      name,
      description,
      videoCount: videoCount || 0,
      exerciseName,
      categorieId:categoryId,
      exerciceId:exerciseId,
      typeId:typeId,
      atackId:atackId, 
      createdAt: new Date().toISOString(),
    };

    const addedLevel = await addLevelToExercise(typeId,categoryId, exerciseId,atackId, newLevel);

    res.status(201).json({ message: 'Level added successfully', level: addedLevel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getVideoByLevelHandler = async (req, res) => {
  try {
    const { typeId, categoryId, exerciseId } = req.params;
    const { Level } = req.query; // 🔥 Use query instead of req.body

    const videos = await getAllVideosByL(typeId, categoryId, exerciseId, Level);

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No video found for this level' });
    }

    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getVideosByDifficultyController = async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!difficulty) {
      return res.status(400).json({ error: 'Difficulty is required as a query parameter.' });
    }

    const videos = await getAllVideosByDifficulty(difficulty);

    return res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error in getVideosByDifficultyController:', error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};




module.exports = {
  addVideoHandler,
  updateVideoHandler,
  deleteVideoHandler,
  getAllVideosHandler,
  getVideoByIdHandler,
  getAllLevelsHandler,
  addLevelHandler,
  addVideoHandler2,
  getAllVideosInExerciceHandler,
  getVideoByLevelHandler,
  getVideosByDifficultyController
};
