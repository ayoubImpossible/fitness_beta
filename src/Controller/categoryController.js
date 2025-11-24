const {
  addCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
  getCategoryWithExercisesLevelsAndVideos,
  updateCategoryInType,
  getCategory,
  getAllCat,
  getVideoCountByCategoryId
} = require('../models/categoryModel');
const { uploadImage, deleteImageFromStorage } = require('../Utils/Helpers');



//get All Categories in db
const getAllCategoryHandler = async (req, res) => {
  try {
    const categories = await getAllCat(); // Call the function to get all categories
    
    if (categories && categories.length > 0) {
      res.status(200).json(categories); // Return the categories as a JSON response
    } else {
      res.status(404).json({ message: "No categories found" }); // Handle case when no categories are found
    }
  } catch (error) {
    console.error("Error in getCategories controller:", error);
    res.status(500).json({ message: "An error occurred while fetching categories." });
  }
};
//get Category by typeId et CategoryId avec data tree
const getCategoryHandler = async (req, res) => {
  const { typeId,categoryId } = req.params;

  try {
    const categoryData = await getCategoryWithExercisesLevelsAndVideos(typeId,categoryId);
    res.status(200).json(categoryData);
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(404).json({ error: error.message });
  }
};
// Add a new category
const addCategoryHandler = async (req, res) => {
  const { typeId } = req.params;

  const { CategorieName, DurationCategorie,description,saved } = req.body;
  const file = req.file; // Image file for the exercise

  try {
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadImage(file); // Upload image to Firebase Storage
    }
    const categoryData = {
      CategorieName,
      DurationCategorie,
      description,
      typeId:typeId,
      saved:Object.prototype.hasOwnProperty.call(req.body, 'saved') ? saved : false,
      Imagebackground:imageUrl
    }
    const newCategory = await addCategory(typeId,categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories by typeId
const getAllCategoriesHandler = async (req, res) => {
  const typeId=req.params.typeId
  try {
    const categories = await getAllCategories(typeId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get a category by typeId et CategoryId
const getCategoryByIdHandler = async (req, res) => {
  try {
    const { typeId,categoryId } = req.params;
    const category = await getCategory(typeId,categoryId);
    res.json(category);
  } catch (error) {
    res.status(404).json({ error: 'Category not found' });
  }
};
// Update a category
const updateCategoryHandler = async (req, res) => {

  const { typeId, categoryId } = req.params;
  const { CategorieName, DurationCategorie  } = req.body;
  const file = req.file; // New image file if provided
  try {
    // Retrieve current exercise data to get the existing image URL
    const currentCategorie = await getCategory(typeId,categoryId);
    let imageUrl = currentCategorie.Imagebackground || null;
    // If a new image is provided, upload it and delete the old image
    if (file) {
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl); // Delete the current image from Firebase Storage
      }
      imageUrl = await uploadImage(file); // Upload new image and get its URL
    }
    // Updated exercise data
    const updatedData = {
      CategorieName,
      typeId:typeId,
      DurationCategorie,
      Imagebackground: imageUrl,
      updatedAt: new Date(),
    };
    // Update exercise in Firestore
    await updateCategoryInType(typeId, categoryId, updatedData);
    res.status(200).json({
      message: 'categorie updated successfully',
      categoryId,
      updatedData,
    });
  } catch (error) {
    console.error("Error updating categorie:", error);
    res.status(500).json({ error: error.message });
  }

};
// Delete a category
const deleteCategoryHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await getCategoryById(id);
    let imageUrl = category.Imagebackground || null;
    if (!category) {
      return res.status(404).json({ message: "category introuvable." });
    }
    if (imageUrl) {
      await deleteImageFromStorage(imageUrl);
    }
    await deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*const updateCategorySavedStatus = async (req, res) => {
  const { typeId, categoryId } = req.params;
  const { saved } = req.body; // Get the saved status from request body

  // Prevent Firestore from receiving undefined values
  if (saved === undefined) {
    return res.status(400).json({ error: "Missing 'saved' field in request body" });
  }

  try {
    const category = await getCategory(typeId, categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Ensure Firestore only gets valid values
    await updateCategoryInType(typeId, categoryId, { saved: Boolean(saved) });

    res.status(200).json({ message: "Saved status updated successfully", saved: Boolean(saved) });
  } catch (error) {
    console.error("Error updating saved status:", error);
    res.status(500).json({ error: error.message });
  }
};*/

const updateCategorySavedStatus = async (req, res) => {
  const { typeId, categoryId, uid } = req.params;
  const { saved } = req.body; // true (save) or false (unsave)

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const category = await getCategory(typeId, categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let savedBy = category.savedBy || []; // Ensure we have an array
    if (saved) {
      // Add uid if not already present
      if (!savedBy.includes(uid)) {
        savedBy.push(uid);
      }
    } else {
      // Remove uid from savedBy array
      savedBy = savedBy.filter(userId => userId !== uid);
    }

    await updateCategoryInType(typeId, categoryId, { savedBy });

    res.status(200).json({ message: "Saved status updated successfully", savedBy });
  } catch (error) {
    console.error("Error updating saved status:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get all categories by typeId
const getCountVideosInCategorie = async (req, res) => {
  const categoryId=req.params.categoryId
  try {
    const count = await getVideoCountByCategoryId(categoryId);
    res.json(count);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  addCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  getCategoryHandler,
  getAllCategoryHandler,
  updateCategorySavedStatus,
  getCountVideosInCategorie
};
