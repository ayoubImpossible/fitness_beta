const {addType, getTypeById, updateType, deleteType, getAllTypes, getVideosByTypeName}=require('../models/TypeModel');
const { uploadImage, deleteImageFromStorage } = require('../Utils/Helpers');

//Add New Type 
const addTypeHandler = async (req, res) => {
    const { TypeName} = req.body;
    const file = req.file; // Image file for the exercise
  
    
    try {
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadImage(file); // Upload image to Firebase Storage
      }
      const typeData = {
        TypeName,
        Imagebackground:imageUrl
      }
      const newType = await addType(typeData);
      res.status(201).json(newType);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
// Delete a type
const deletetypeAndImageHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const type = await getTypeById(id);
    let imageUrl = type.Imagebackground || null;
    if (!type) {
      return res.status(404).json({ message: "type introuvable." });
    }
    if (imageUrl) {
      await deleteImageFromStorage(imageUrl);
    }
    await deleteType(id);
    res.status(200).json({ message: "type et image supprimés avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de type et de l'image." });
  }
};
// Update a type
const updateTypeHandler = async (req, res) => {
  const {  typeId } = req.params;
  const { TypeName } = req.body;
  const file = req.file; // New image file if provided
  try {
    // Retrieve current exercise data to get the existing image URL
    const currentType = await getTypeById(typeId);
    let imageUrl = currentType.Imagebackground || null;
    // If a new image is provided, upload it and delete the old image
    if (file) {
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl); // Delete the current image from Firebase Storage
      }
      imageUrl = await uploadImage(file); // Upload new image and get its URL
    }
    // Updated exercise data
    const updatedData = {
      TypeName,
      Imagebackground: imageUrl,
      updatedAt: new Date(),
    };
    // Update exercise in Firestore
    await updateType(typeId,updatedData);
    res.status(200).json({
      message: 'Type updated successfully',
      typeId,
      updatedData,
    });
  } catch (error) {
    console.error("Error updating Type:", error);
    res.status(500).json({ error: error.message });
  }

};
// Get Type





const getTypesHandler = async (req, res) => {
  try {
    const typesData = await getAllTypes();
    res.status(200).json(typesData);
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(404).json({ error: error.message });
  }
};
















  

const getAllVideoByTypeName = async (req, res) => {
  const { typeName} = req.params;

      try {
          const collection = await getVideosByTypeName(
            typeName);
          res.json(collection);

        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

  module.exports={addTypeHandler,deletetypeAndImageHandler,updateTypeHandler,getTypesHandler,getAllVideoByTypeName}