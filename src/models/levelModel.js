const { db,bucket, admin  } = require('../Firebase/firebaseAdmin');


// Helper to get the videos collection
const getVideosCollection = (typeId,categoryId, exerciseId, levelId,atackId) => 
  db.collection('types')
.doc(typeId).collection('categories')
    .doc(categoryId).
    collection('exercises').
    doc(exerciseId)
    .collection('atack').
    doc(atackId).
    collection('levels').
    doc(levelId).
    collection('videos');



    const getVideoCollectionInExercise = async (typeId, categoryId, exerciseId) => {
      const videos = [];
    
      // Reference to attacks inside the exercise
      const attacksRef = db.collection('types')
        .doc(typeId)
        .collection('categories')
        .doc(categoryId)
        .collection('exercises')
        .doc(exerciseId)
        .collection('atack');
    
      const attacksSnapshot = await attacksRef.get();
    
      for (const attackDoc of attacksSnapshot.docs) {
        const attackId = attackDoc.id;
    
        // Reference to levels inside the attack
        const levelsRef = attacksRef.doc(attackId).collection('levels');
        const levelsSnapshot = await levelsRef.get();
    
        for (const levelDoc of levelsSnapshot.docs) {
          const levelId = levelDoc.id;
    
          // Reference to videos inside the level
          const videosRef = levelsRef.doc(levelId).collection('videos');
          const videosSnapshot = await videosRef.get();
    
          for (const videoDoc of videosSnapshot.docs) {
            videos.push({
              id: videoDoc.id,
              attackId,
              levelId,
              ...videoDoc.data(),
            });
          }
        }
      }
    
      return videos;
    };
    
// Add a video to a level Valide
const addVideoToLevel = async (typeId,categoryId, exerciseId, atackId,levelId ,videoData) => {
  const videosCollection = getVideosCollection(typeId,categoryId, exerciseId, levelId,atackId);
  const videoDoc = await videosCollection.add(videoData);

  // Create a notification
  const notificationRef = db.collection('notifications');
  await notificationRef.add({
    message: `A new video "${videoData.name}" has been added.`,
    videoId: videoDoc.id,
    imageUrl:videoData.imageUrl,
    type: 'video',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false, // Mark the notification as unread
  });

  return { id: videoDoc.id, ...videoData };
};


// Update a video in a level Valide
const updateVideoInLevel = async (categoryId, exerciseId,atackId, levelId, videoId, updatedData) => {
  const videoDoc = getVideosCollection(categoryId, exerciseId, levelId,atackId).doc(videoId);
  await videoDoc.update(updatedData);
  const updatedVideo = await videoDoc.get();
  return { id: updatedVideo.id, ...updatedVideo.data() };
};

// Get all videos in a level
const getAllVideosInLevel = async (typeId,categoryId, exerciseId, atackId,levelId) => {
  const snapshot = await getVideosCollection(typeId,categoryId, exerciseId, levelId,atackId).get();
  const videos = [];
  snapshot.forEach(doc => videos.push({ id: doc.id, ...doc.data() }));
  return videos;
};


// Get a video by ID in a level
const getVideoById = async (typeId,categoryId, exerciseId,atackId, levelId,videoId) => {
  const videoDoc = await getVideosCollection(typeId,categoryId, exerciseId, levelId,atackId).doc(videoId).get();
  if (!videoDoc.exists) throw new Error('Video not found');
  return { id: videoDoc.id, ...videoDoc.data() };
};

// GetAllLevelsInExercices
const getAllLevelsInExercise = async (typeId,categoryId, exerciseId,atackId) => {
  const levelsRef = db
  .collection('types')
  .doc(typeId).collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    collection('atack')
    .doc(atackId).
    collection('levels');

  const snapshot = await levelsRef.get();
  const levels = [];
  snapshot.forEach((doc) => {
    levels.push({ id: doc.id, ...doc.data() });
  });

  return levels;
};

//Add level to exercice
const addLevelToExercise = async (typeId, categoryId, exerciseId, atackId, levelData) => {
  const levelsRef = db
    .collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .collection('atack')
    .doc(atackId)
    .collection('levels');

  const newLevelRef = levelsRef.doc(); // Auto-generate ID
  await newLevelRef.set(levelData); // Save level data
  return { id: newLevelRef.id, ...levelData }; // Return new level with ID
};


const getAllVideosByL = async (typeId, categoryId, exerciseId, Level) => {
  const atackRef = db
    .collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .collection('atack');

  const atackSnapshot = await atackRef.get();
  const videos = [];

  for (const atackDoc of atackSnapshot.docs) {
    const levelsRef = atackDoc.ref.collection('levels');
    const levelSnapshot = await levelsRef.get();

    for (const levelDoc of levelSnapshot.docs) {
      const levelData = levelDoc.data();

      if (levelData.name && levelData.name.toLowerCase() === Level.toLowerCase()) {
        console.log(Level)

        const videosRef = levelDoc.ref.collection('videos'); 
        const videosSnap = await videosRef.get();
        videosSnap.forEach(videoDoc => {
          videos.push({
            id: videoDoc.id,
            ...videoDoc.data(),
            atackId: atackDoc.id,
            levelId: levelDoc.id
          });
        });

        break; 
      }
    }
  }

  return videos;
};

const getAllVideosByDifficulty = async (difficulty) => {
  try {
    const typesSnapshot = await db.collection('types').get();
    const videoPromises = typesSnapshot.docs.map(async (typeDoc) => {
      const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

      const categoryPromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

        const exercisePromises = exercisesSnapshot.docs.map(async (exerciseDoc) => {
          const atackSnapshot = await exerciseDoc.ref.collection('atack').get();

          const atackPromises = atackSnapshot.docs.map(async (atackDoc) => {
            const levelsSnapshot = await atackDoc.ref.collection('levels').get();

            const levelPromises = levelsSnapshot.docs.map(async (levelDoc) => {
              const videosSnapshot = await levelDoc.ref.collection('videos')
                .where('difficulty', '==', difficulty)
                .get();

              return videosSnapshot.docs.map(videoDoc => ({
                id: videoDoc.id,
                ...videoDoc.data(),
              }));
            });

            return (await Promise.all(levelPromises)).flat();
          });

          return (await Promise.all(atackPromises)).flat();
        });

        return (await Promise.all(exercisePromises)).flat();
      });

      return (await Promise.all(categoryPromises)).flat();
    });

    const allVideos = (await Promise.all(videoPromises)).flat();
    return allVideos;
  } catch (error) {
    console.error("Error fetching videos by difficulty:", error);
    return [];
  }
};




    

module.exports = {
  addVideoToLevel,
  updateVideoInLevel,
  getAllVideosInLevel,
  getVideoById,
  getAllLevelsInExercise,
  addLevelToExercise,
  getVideoCollectionInExercise,
  getAllVideosByL,
  getAllVideosByDifficulty
};
