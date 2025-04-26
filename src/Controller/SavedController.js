const { getAllSavedCategoriesByUid } = require("../models/SavedM");

const getSavedCategoriesHandler = async (req, res) => {
  const { uid } = req.params;  // Get the UID from the request parameters

  try {
    const savedCategories = await getAllSavedCategoriesByUid(uid); // Fetch saved categories by UID

    if (savedCategories.length > 0) {
      res.status(200).json(savedCategories); // Return the categories as JSON
    } else {
      res.status(404).json({ message: "No saved categories found for this user" });
    }
  } catch (error) {
    console.error("Error in getSavedCategoriesHandler:", error);
    res.status(500).json({ message: "An error occurred while fetching saved categories." });
  }
};

module.exports = { getSavedCategoriesHandler };
