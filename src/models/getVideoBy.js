const { db } = require('../Firebase/firebaseAdmin');




// is optimisé 🆗
const getAllVideosByDuration = async (duration) => {
  try {
    const videosSnapshot = await db.collectionGroup("videos")
      .where("duration", "==", duration)
      .get();

    const allVideos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return allVideos;
  } catch (error) {
    console.error("Error fetching videos by duration:", error);
    return [];
  }
};
// is optimisé 🆗
const getAllVideosByeq = async (equipment) => {
  try {
    const videosSnapshot = await db.collectionGroup("videos")
      .where("equipment", "==", equipment)
      .get();

    const allVideos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return allVideos;
  } catch (error) {
    console.error("Error fetching videos by equipment:", error);
    return [];
  }
};
// is optimisé 🆗
const getAllVideosBylevel= async (difficulty) => {
  try {
    const videosSnapshot = await db.collectionGroup("videos")
      .where("difficulty", "==", difficulty)
      .get();

    const allVideos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return allVideos;
  } catch (error) {
    console.error("Error fetching videos by difficulty:", error);
    return [];
  }
};
//optimisé done 🆗
const getAllEquipmentTypes = async (exerciceId) => {
  try {
    const videosSnapshot = await db.collectionGroup("videos")
      .where("exerciceId", "==", exerciceId) 
      .get();

    const equipmentSet = new Set();

    videosSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.equipment) {
        equipmentSet.add(data.equipment);
      }
    });

    return Array.from(equipmentSet);
  } catch (error) {
    console.error("Error fetching equipment types:", error);
    throw error;
  }
};
//optimisé done 🆗
const getAllEquipmentTypes_2 = async () => {
  try {
    const snapshot = await db.collectionGroup('videos').get(); 
    let equipmentSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.equipment) {
        equipmentSet.add(data.equipment);
      }
    });


    return Array.from(equipmentSet); 
  } catch (error) {
    console.error('Error fetching all equipment types:', error);
    throw error;
  }
};

//optimisé done 🆗
const getAllDurationsTypes_2 = async () => {
  try {
    const snapshot = await db.collectionGroup('videos').get();  
    let durationSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.difficulty) {
        durationSet.add(data.difficulty);
      }
    });

    return Array.from(durationSet); 
  } catch (error) {
    console.error('Error fetching all difficulty types:', error);
    throw error;
  }
};


// optimisé done 🆗
const getAllDurationsTypes = async (exerciceId) => {
  try {
    const videosSnapshot = await db.collectionGroup("videos")
      .where("exerciceId", "==", exerciceId)  
      .get();

    if (videosSnapshot.empty) {
      console.log(`No videos found for exercise ${exerciceId}`);
      return [];
    }

    const durationSet = new Set();
    videosSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.duration) {
        durationSet.add(data.duration);
      }
    });

    return Array.from(durationSet);
  } catch (error) {
    console.error("Error fetching durations:", error);
    throw error;
  }
};



// optimisé done 🆗
// const getAllVid = async () => {
//   try {
//     const videosSnapshot = await db.collectionGroup('videos').get();

//     if (videosSnapshot.empty) {
//       console.log('No videos found');
//       return [];
//     }

//     return videosSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       path: doc.ref.path, 
//       ...doc.data(),
//     }));
//   } catch (error) {
//     console.error('Error fetching all videos:', error);
//     return [];
//   }
// };

const getAllVid = async () => {
  try {
    const videosSnapshot = await db.collectionGroup("videos").get();

    if (videosSnapshot.empty) {
      console.log("No videos found");
      return [];
    }

    return videosSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Extract category ID from path
      // path example: types/{typeId}/categories/{categoryId}/exercises/.../videos/{videoId}
      const pathParts = doc.ref.path.split("/");
      const categoryIndex = pathParts.indexOf("categories");
      const category = categoryIndex !== -1 ? pathParts[categoryIndex + 1] : "uncategorized";

      return {
        id: doc.id,
        path: doc.ref.path,
        category, // <-- new
        ...data,
      };
    });
  } catch (error) {
    console.error("Error fetching all videos:", error);
    return [];
  }
};




module.exports = {
  getAllEquipmentTypes,
  getAllDurationsTypes,
  getAllVid,getAllVideosBylevel,
  getAllDurationsTypes_2,
  getAllEquipmentTypes_2,getAllVideosByDuration,getAllVideosByeq
};
