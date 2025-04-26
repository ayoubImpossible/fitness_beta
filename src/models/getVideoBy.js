const { db } = require('../Firebase/firebaseAdmin');

const getAllVideosForExerciseByDuration = async (typeId, categoryId, exerciceId, duration) => {
  try {
    // Reference to the exercise
    const exerciseRef = db
      .collection('types')
      .doc(typeId)
      .collection('categories')
      .doc(categoryId)
      .collection('exercises')
      .doc(exerciceId);
    // Fetch all `atack` sub-collections within the exercise
    const atackCollections = await exerciseRef.collection('atack').listDocuments();
    let allVideos = [];
    // Iterate through each `atack` document
    for (const atackDoc of atackCollections) {
      // Fetch all `level` sub-collections within the `atack` document
      const levelCollections = await atackDoc.collection('levels').listDocuments();
      for (const levelDoc of levelCollections) {
        // Query the `videos` collection within the `level` document
        const videosSnapshot = await levelDoc.collection('videos').where('duration', '==', duration).get();

        if (!videosSnapshot.empty) {
          const videos = videosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allVideos = allVideos.concat(videos);
        }
      }
    }
    if (allVideos.length === 0) {
      console.log(`No videos found with duration: ${duration}`);
      return [];
    }
    return allVideos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

const getAllVideosByDuration = async (duration) => {
  try {
    const typesSnapshot = await db.collection('types').get(); // Fetch all types
    let allVideos = [];

    const categoryPromises = typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      const exercisePromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        const atackPromises = exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const atackCollections = await exerciseDoc.ref.collection('atack').get();

          const levelPromises = atackCollections.docs.map(async (atackDoc) => {
            const levelCollections = await atackDoc.ref.collection('levels').get();

            const videoPromises = levelCollections.docs.map(async (levelDoc) => {
              const videosSnapshot = await levelDoc.ref.collection('videos')
                .where('duration', '==', duration)
                .get();

              return videosSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
              }));
            });

            return (await Promise.all(videoPromises)).flat();
          });

          return (await Promise.all(levelPromises)).flat();
        });

        return (await Promise.all(atackPromises)).flat();
      });

      return (await Promise.all(exercisePromises)).flat();
    });

    allVideos = (await Promise.all(categoryPromises)).flat();
    return allVideos;
  } catch (error) {
    console.error('Error fetching videos by duration:', error);
    return [];
  }
};




const getAllVideosByeq = async (equipment) => {
  try {
    const typesSnapshot = await db.collection('types').get(); // Fetch all types
    let allVideos = [];

    const categoryPromises = typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      const exercisePromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        const atackPromises = exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const atackCollections = await exerciseDoc.ref.collection('atack').get();

          const levelPromises = atackCollections.docs.map(async (atackDoc) => {
            const levelCollections = await atackDoc.ref.collection('levels').get();

            const videoPromises = levelCollections.docs.map(async (levelDoc) => {
              const videosSnapshot = await levelDoc.ref.collection('videos')
                .where('equipment', '==', equipment)
                .get();

              return videosSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
              }));
            });

            return (await Promise.all(videoPromises)).flat();
          });

          return (await Promise.all(levelPromises)).flat();
        });

        return (await Promise.all(atackPromises)).flat();
      });

      return (await Promise.all(exercisePromises)).flat();
    });

    allVideos = (await Promise.all(categoryPromises)).flat();
    return allVideos;
  } catch (error) {
    console.error('Error fetching videos by equipment:', error);
    return [];
  }
};








// Function to get all unique equipment types in the database
const getAllEquipmentTypes = async (typeId, categoryId, exerciceId) => {
  try {
    const exerciseRef = db
      .collection('types')
      .doc(typeId)
      .collection('categories')
      .doc(categoryId)
      .collection('exercises')
      .doc(exerciceId);
    const atackCollections = await exerciseRef.collection('atack').listDocuments();
    let equipmentSet = new Set();

    // Iterate through each `atack` document
    for (const atackDoc of atackCollections) {
      const levelCollections = await atackDoc.collection('levels').listDocuments();
      for (const levelDoc of levelCollections) {
        const videosSnapshot = await levelDoc.collection('videos').get();
        videosSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.equipment) {
            equipmentSet.add(data.equipment);
          }
        });
      }
    }

    // Convert Set to Array
    return Array.from(equipmentSet);
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    throw error;
  }
};




const getAllEquipmentTypes_2 = async () => {
  try {
    const snapshot = await db.collectionGroup('videos').get(); // Fetch all 'videos' subcollections
    let equipmentSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.equipment) {
        equipmentSet.add(data.equipment);
      }
    });


    return Array.from(equipmentSet); // Convert Set to Array
  } catch (error) {
    console.error('Error fetching all equipment types:', error);
    throw error;
  }
};





// Function to get all unique equipment types in the database
const getAllDurationsTypes = async (typeId, categoryId, exerciceId) => {
  try {
    const exerciseRef = db
      .collection('types')
      .doc(typeId)
      .collection('categories')
      .doc(categoryId)
      .collection('exercises')
      .doc(exerciceId);
    const atackCollections = await exerciseRef.collection('atack').listDocuments();
    let durationSet = new Set();

    // Iterate through each `atack` document
    for (const atackDoc of atackCollections) {
      const levelCollections = await atackDoc.collection('levels').listDocuments();
      for (const levelDoc of levelCollections) {
        const videosSnapshot = await levelDoc.collection('videos').get();
        videosSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.duration) {
            durationSet.add(data.duration);
          }
        });
      }
    }

    // Convert Set to Array
    return Array.from(durationSet);
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    throw error;
  }
};




const getAllDurationsTypes_2 = async () => {
  try {
    const snapshot = await db.collectionGroup('videos').get(); // Fetch all 'videos' subcollections
    let durationSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.duration) {
        durationSet.add(data.duration);
      }
    });

    return Array.from(durationSet); // Convert Set to Array
  } catch (error) {
    console.error('Error fetching all duration types:', error);
    throw error;
  }
};



const getAllVideosForExerciseByEquipment= async (typeId, categoryId, exerciceId, equipment) => {
  try {
    // Reference to the exercise
    const exerciseRef = db
      .collection('types')
      .doc(typeId)
      .collection('categories')
      .doc(categoryId)
      .collection('exercises')
      .doc(exerciceId);
    // Fetch all `atack` sub-collections within the exercise
    const atackCollections = await exerciseRef.collection('atack').listDocuments();
    let allVideos = [];
    // Iterate through each `atack` document
    for (const atackDoc of atackCollections) {
      // Fetch all `level` sub-collections within the `atack` document
      const levelCollections = await atackDoc.collection('levels').listDocuments();
      for (const levelDoc of levelCollections) {
        // Query the `videos` collection within the `level` document
        const videosSnapshot = await levelDoc.collection('videos').where('equipment', '==', equipment).get();

        if (!videosSnapshot.empty) {
          const videos = videosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allVideos = allVideos.concat(videos);
        }
      }
    }
    if (allVideos.length === 0) {
      console.log(`No videos found with duration: ${duration}`);
      return [];
    }
    return allVideos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};
/*const getAllVid = async () => {
  try {
    const typesRef = db.collection('types'); // Reference to the 'types' collection
    const typesSnapshot = await typesRef.get(); // Fetch all documents from 'types'
    let allVideos  = []; // Initialize an array to store categories

    // Loop through each document in the 'types' collection
    for (const typeDoc of typesSnapshot.docs) {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();
      
      // Iterate over all `categories` documents within each type
      for (const categoryDoc of categoriesSnapshot.docs) {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();
        
        // Iterate over all `exercises` within each category
        for (const exerciseDoc of exercisesSnapshot.docs) {
          const atackCollections = await exerciseDoc.ref.collection('atack').get();
          
          // Iterate over all `atack` documents within each exercise
          for (const atackDoc of atackCollections.docs) {
            const levelCollections = await atackDoc.ref.collection('levels').get();
            
            // Iterate over all `levels` within each `atack`
            for (const levelDoc of levelCollections.docs) {
              const videosSnapshot = await levelDoc.ref.collection('videos').get();
              
              // Fetch all videos from the `videos` collection
              videosSnapshot.forEach((doc) => {
                const videoData = doc.data();
                allVideos.push({
                  id: doc.id,
                  ...videoData
                });
              });
            }
          }
        }
      }
    }

    // Return the array of all categories as a JSON
    return allVideos;
  } catch (error) {
    console.error("Error fetching categories:", error); // Log any errors
    return []; // Return an empty array in case of error
  }
};
*/
const getAllVid = async () => {
  try {
    const typesSnapshot = await db.collection('types').get(); // Fetch all types
    let allVideos = [];

    const categoryPromises = typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      const exercisePromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        const atackPromises = exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const atackCollections = await exerciseDoc.ref.collection('atack').get();

          const levelPromises = atackCollections.docs.map(async (atackDoc) => {
            const levelCollections = await atackDoc.ref.collection('levels').get();

            const videoPromises = levelCollections.docs.map(async (levelDoc) => {
              const videosSnapshot = await levelDoc.ref.collection('videos').get();

              return videosSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
              }));
            });

            return (await Promise.all(videoPromises)).flat();
          });

          return (await Promise.all(levelPromises)).flat();
        });

        return (await Promise.all(atackPromises)).flat();
      });

      return (await Promise.all(exercisePromises)).flat();
    });

    allVideos = (await Promise.all(categoryPromises)).flat();
    return allVideos;
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};



module.exports = {
  getAllVideosForExerciseByDuration,
  getAllVideosForExerciseByEquipment,
  getAllEquipmentTypes,
  getAllDurationsTypes,
  getAllVid,
  getAllDurationsTypes_2,
  getAllEquipmentTypes_2,getAllVideosByDuration,getAllVideosByeq
};
