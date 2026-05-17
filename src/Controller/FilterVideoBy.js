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


const getAllDuration_2=async(req,res)=>{
       try{
        const durations = await getAllDurationsTypes_2();
      res.json(durations);
       }catch(error){
        res.status(500).json({error:error.message});
       }
}


const getAllVideosHandler = async (req, res) => {
  try {
    const videos = await getAllVid(); 
    if (videos && videos.length > 0) {
      res.status(200).json(videos); 
    } else {
      res.status(404).json({ message: "No videos found" }); 
    }
  } catch (error) {
    console.error("Error in getAllVideosHandler controller:", error);
    res.status(500).json({ message: "An error occurred while fetching videos." });
  }
};

const deleteVideoHandler = async (req, res) => {
  try {
    const { path, id } = req.query; // Expecting document path
    if (!path) return res.status(400).json({ message: "Path is required" });
    
    // The model deleteVideo takes (collectionPath, videoId)
    // path is 'types/.../videos/videoId'
    const collectionPath = path.substring(0, path.lastIndexOf('/'));
    const { deleteVideo } = require("../models/getVideoBy");
    await deleteVideo(collectionPath, id);
    res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVideoHandler = async (req, res) => {
  try {
    const { path, id, data } = req.body;
    if (!path) return res.status(400).json({ message: "Path is required" });
    
    const collectionPath = path.substring(0, path.lastIndexOf('/'));
    const { updateVideo } = require("../models/getVideoBy");
    await updateVideo(collectionPath, id, data);
    res.json({ success: true, message: "Video updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


  module.exports = {
    getAllVideoBytime,
    getAllEquipment,
    getAllDuration,
    getAllVideosHandler,
    deleteVideoHandler,
    updateVideoHandler,
    getAllDuration_2,
    getAllEquipment_2,getAllVideoByeq,getAllVideoBylevel
  };