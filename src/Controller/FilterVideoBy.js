const { db } = require("../Firebase/firebaseAdmin");
const { getAllEquipmentTypes, getAllDurationsTypes, getAllVid, getAllDurationsTypes_2, getAllEquipmentTypes_2, getAllVideosByDuration, getAllVideosByeq, getAllVideosBylevel } = require("../models/getVideoBy");



 // Get  all videos in exercice by time 
const getAllVideoBytime = async (req, res) => {
    const { duration} = req.params;

        try {
            const collection = await getAllVideosByDuration(
                duration);
            res.json(collection);

          } catch (error) {
            res.status(500).json({ error: error.message });
          }
  };

  const getAllVideoByeq = async (req, res) => {
    const { equipment} = req.params;

        try {
            const collection = await getAllVideosByeq(
              equipment);
            res.json(collection);

          } catch (error) {
            res.status(500).json({ error: error.message });
          }
  };
const getAllVideoBylevel = async (req, res) => {
    const { level} = req.params;

        try {
            const collection = await getAllVideosBylevel(
              level);
            res.json(collection);

          } catch (error) {
            res.status(500).json({ error: error.message });
          }
  };
//get all equipments
const getAllEquipment=async(req,res)=>{
  const{exerciceId}=req.params;
       try{
        const equipment = await getAllEquipmentTypes(exerciceId);
      res.json(equipment);
       }catch(error){
        res.status(500).json({error:error.message});
       }
}

const getAllEquipment_2=async(req,res)=>{
       try{
        const equipment = await getAllEquipmentTypes_2();
      res.json(equipment);
       }catch(error){
        res.status(500).json({error:error.message});
       }
}
//get all duration
const getAllDuration=async(req,res)=>{
  const{exerciceId}=req.params;
       try{
        const durations = await getAllDurationsTypes(
          exerciceId);
      res.json(durations);
       }catch(error){
        res.status(500).json({error:error.message});
       }
}
//get all duration
const getAllDuration_2=async(req,res)=>{
       try{
        const durations = await getAllDurationsTypes_2();
      res.json(durations);
       }catch(error){
        res.status(500).json({error:error.message});
       }
}
//get All Categories in db
const getAllVideosHandler = async (req, res) => {
  try {
    const videos = await getAllVid(); // Call the function to get all categories
    
    if (videos && videos.length > 0) {
      res.status(200).json(videos); // Return the categories as a JSON response
    } else {
      res.status(404).json({ message: "No categories found" }); // Handle case when no categories are found
    }
  } catch (error) {
    console.error("Error in getCategories controller:", error);
    res.status(500).json({ message: "An error occurred while fetching categories." });
  }
};


  module.exports = {
    getAllVideoBytime,
    getAllEquipment,
    getAllDuration,
    getAllVideosHandler,
    getAllDuration_2,
    getAllEquipment_2,getAllVideoByeq,getAllVideoBylevel
  };