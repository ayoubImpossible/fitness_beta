const {  getExerciseById, 
  addExerciseToCategory, updateExerciseInCategory, 
  deleteExerciseFromDatabase, getExerciseByIdinType, 
  getAllExercisesIn} = require('../models/exerciseModel');
const {getLevelsWithVideos, uploadImage, deleteImageFromStorage} =require('../Utils/Helpers')
const {db}=require('../Firebase/firebaseAdmin')



// Add a new exercise
const addExerciseHandler = async (req, res) => {
  const { typeId,categoryId } = req.params;
  const { name, description, muscleAttack ,duration } = req.body;
  const file = req.file; // Image file for the exercise
  try {
    // Upload image if provided
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadImage(file); // Upload image to Firebase Storage
    }
    // Create exercise data object
    const exerciseData = {
      name,
      description,
      muscleAttack,
      duration,
      image: imageUrl,
      typeId:typeId,
      categorieId:categoryId,
      createdAt: new Date(),
    };
    // Save exercise to database
    const exerciseId = await addExerciseToCategory(typeId,categoryId, exerciseData);
    res.status(201).json({
      message: 'Exercise added successfully',
      exerciseId,
      exerciseData,
    });
  } catch (error) {
    console.error("Error adding exercise:", error);
    res.status(500).json({ error: error.message });
  }
};





// Get all exercises for a category
const getAllExercisesInCat = async (req, res) => {
  const { typeId,categoryId } = req.params;
  const exercises = await getAllExercisesIn(typeId,categoryId);
  res.json(exercises);
};
// Get an exercise by ID
const getExerciceById = async (req, res) => {
  const {typeId,categoryId,exerciceId}=req.params;
  const exercise = await getExerciseById(typeId,categoryId,exerciceId);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  res.json(exercise);
};
//update exercice handler
const updateExerciseHandler = async (req, res) => {
  const { typeId,categoryId, exerciseId } = req.params;
  const { name, description, muscleAttack,duration } = req.body;
  const file = req.file; // New image file if provided
  try {
    // Retrieve current exercise data to get the existing image URL
    const currentExercise = await getExerciseByIdinType(typeId,categoryId, exerciseId);
    let imageUrl = currentExercise.image || null;
    // If a new image is provided, upload it and delete the old image
    if (file) {
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl); // Delete the current image from Firebase Storage
      }
      imageUrl = await uploadImage(file); // Upload new image and get its URL
    }
    // Updated exercise data
    const updatedData = {
      name,
      description,
      muscleAttack,
      duration,
      image: imageUrl,
      typeId:typeId,categoryId:categoryId,
      updatedAt: new Date(),
    };
    // Update exercise in Firestore
    await updateExerciseInCategory(typeId,categoryId, exerciseId, updatedData);
    res.status(200).json({
      message: 'Exercise updated successfully',
      exerciseId,
      updatedData,
    });
  } catch (error) {
    console.error("Error updating exercise:", error);
    res.status(500).json({ error: error.message });
  }
};
// Delete an exercise
const deleteExerciseAndImage = async (req, res) => {
  const { typeId,categoryId,exerciseId } = req.params;
  try {
    const exercise = await getExerciseByIdinType(typeId,categoryId,exerciseId);
    let imageUrl = exercise.image || null;
    if (!exercise) {
      return res.status(404).json({ message: "Exercice introuvable." });
    }
    if (imageUrl) {
      await deleteImageFromStorage(imageUrl);
    }
    await deleteExerciseFromDatabase(typeId,categoryId,exerciseId);
    res.status(200).json({ message: "Exercice et image supprimés avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'exercice et de l'image." });
  }
};
//get exercice data
const getExerciseByIdWithLevelsAndVideos = async (req, res) => {
  try {
    const { typeId,categoryId, exerciseId,atackId } = req.params;
    // Fetch the exercise details
    const exerciseRef = db.collection('types').doc(typeId)
    .collection('categories').doc(categoryId).collection('exercises').doc(exerciseId);
    const exerciseDoc = await exerciseRef.get();
    if (!exerciseDoc.exists) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    // Fetch levels and videos
    const exerciseData = exerciseDoc.data();
    const levels = await getLevelsWithVideos(typeId,categoryId, exerciseId,atackId);
    // Combine exercise data with levels and videos
    const response = {
      id: exerciseId,
      ...exerciseData,
      levels: levels
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
    getAllExercisesInCat, getExerciceById,
    addExerciseHandler, updateExerciseHandler,
    deleteExerciseAndImage,getExerciseByIdWithLevelsAndVideos 
  };
