
const {getLevelsWithVideos, uploadImage, deleteImageFromStorage} =require('../Utils/Helpers')
const {db}=require('../Firebase/firebaseAdmin');
const { addAtack_To_Exercice, getAllAtacks, getAtackById, update_Atack_In_Exercice, delete_Atack_From_Database, getAllAtacks_2, getVideosByMuscleAttack } = require('../models/atackmusculModel');
  





  // Add a new atack
  const addatackHandler = async (req, res) => {
    const { typeId,categoryId,exerciceId } = req.params;
    const { name, muscleAttack  } = req.body;
    const file = req.file; // Image file for the exercise
    try {
      // Upload image if provided
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadImage(file); // Upload image to Firebase Storage
      }
      // Create exercise data object
      const atackData = {
        name,
        muscleAttack,
        image_muscleAttack: imageUrl,
        typeId:typeId,
        categorieId:categoryId,
        exerciceId:exerciceId,
        createdAt: new Date(),
      };
      // Save exercise to database
      const newatack = await addAtack_To_Exercice(typeId,categoryId,exerciceId, atackData);
      res.status(201).json({
        message: 'atack added successfully',
        newatack,
        atackData,
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
      res.status(500).json({ error: error.message });
    }
  };
 
  // Get an atack by ID
 



  //update atack handler
  const updateAtackHandler = async (req, res) => {
    const { typeId,categoryId, exerciseId,atackId } = req.params;
    const { name, muscleAttack } = req.body;
    const file = req.file; // New image file if provided
    try {
      // Retrieve current exercise data to get the existing image URL
      const currentatack = await getAtackById(typeId,categoryId, exerciseId,atackId);
      let imageUrl = currentatack.image || null;
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
        muscleAttack,
        image: imageUrl,
        typeId:typeId,categoryId:categoryId,
        categoryId:categoryId,
        exerciseId:exerciseId,
        updatedAt: new Date(),
      };
      // Update exercise in Firestore
      await update_Atack_In_Exercice(typeId,categoryId, exerciseId,atackId, updatedData);
      res.status(200).json({
        message: 'Exercise updated successfully',
        atackId,
        updatedData,
      });
    } catch (error) {
      console.error("Error updating exercise:", error);
      res.status(500).json({ error: error.message });
    }
  };




  // Delete an exercise
  const deleteAtackHandler = async (req, res) => {
    const { typeId,categoryId,exerciseId,atackId } = req.params;
    try {
      const atack = await getAtackById(typeId,categoryId,exerciseId,atackId);
      let imageUrl = atack.image || null;
      if (!atack) {
        return res.status(404).json({ message: "atack introuvable." });
      }
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      await delete_Atack_From_Database(typeId,categoryId,exerciseId,atackId);
      res.status(200).json({ message: "atack et image supprimés avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      res.status(500).json({ message: "Erreur serveur lors de la suppression de l'atack et de l'image." });
    }
  };



 // Get all atacks for a exercice
  const getAllAtacksHandler = async (req, res) => {
    const { typeId,categoryId,exerciceId } = req.params;
    const atacks = await getAllAtacks(typeId,categoryId,exerciceId);
    res.json(atacks);
  };
  const getAtackByIdHandler = async (req, res) => {
    const {typeId,categoryId,exerciceId,atackId}=req.params;
    const atack = await getAtackByIdHandler(typeId,categoryId,exerciceId,atackId);
    if (!atack) {
      return res.status(404).json({ error: 'atack not found' });
    }
    res.json(exercise);
  };
  //get exercice data
  const getAllAtackDatasHandler = async (req, res) => {
    try {
      const { typeId,categoryId, exerciseId,atackId } = req.params;
      // Fetch the exercise details
      const atackRef = db.collection('types').doc(typeId)
      .collection('categories').doc(categoryId).
      collection('exercises').doc(exerciseId).
      collection('atack').doc(atackId);
      const atackDoc = await atackRef.get();
      if (!atackDoc.exists) {
        return res.status(404).json({ error: 'atack not found' });
      }
      // Fetch levels and videos
      const atackData = atackDoc.data();
      const levels = await getLevelsWithVideos(typeId,categoryId, exerciseId,atackId);
      // Combine exercise data with levels and videos
      const response = {
        id: atackId,
        ...atackData,
        levels: levels
      };
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


   // Get all atacks for a exercice
   const getAllAtacksHandler_2 = async (req, res) => {
    const atacks = await getAllAtacks_2();
    res.json(atacks);
  };
  const getAllVideoByatack = async (req, res) => {
    const { muscleAttack} = req.params;

        try {
            const collection = await getVideosByMuscleAttack(
              muscleAttack);
            res.json(collection);

          } catch (error) {
            res.status(500).json({ error: error.message });
          }
  };

  




  /*
const getVideosByMuscleAttack = async (req, res) => {
    try {
      const { muscleAttack } = req.params; // Get muscleAttack from request parameters
      const typesSnapshot = await db.collection('types').get();
      
      let results = [];
  
      for (const typeDoc of typesSnapshot.docs) {
        const typeId = typeDoc.id;
        const categoriesSnapshot = await db.collection('types').doc(typeId).collection('categories').get();
        
        for (const categoryDoc of categoriesSnapshot.docs) {
          const categoryId = categoryDoc.id;
          const exercisesSnapshot = await db.collection('types').doc(typeId)
            .collection('categories').doc(categoryId)
            .collection('exercises').get();
          
          for (const exerciseDoc of exercisesSnapshot.docs) {
            const exerciseId = exerciseDoc.id;
            const atackSnapshot = await db.collection('types').doc(typeId)
              .collection('categories').doc(categoryId)
              .collection('exercises').doc(exerciseId)
              .collection('atack')
              .where('muscleAttack', '==', muscleAttack)
              .get();
            
            for (const atackDoc of atackSnapshot.docs) {
              const atackId = atackDoc.id;
  
              // Fetch videos related to this attack
              const levels = await getLevelsWithVideos(typeId, categoryId, exerciseId, atackId);
  
              results.push({
                typeId,
                categoryId,
                exerciseId,
                atackId,
                atackName: atackDoc.data().name,
                videos: levels,
              });
            }
          }
        }
      }
  
      res.status(200).json({ message: "Videos retrieved successfully", results });
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: error.message });
    }
  };*/
  
  
  module.exports = { 
                    addatackHandler,
                    getAllAtacksHandler,
                    getAtackByIdHandler,
                    updateAtackHandler,
                    deleteAtackHandler,
                    getAllAtackDatasHandler,
                    getAllAtacksHandler_2,getAllVideoByatack
                   };
  