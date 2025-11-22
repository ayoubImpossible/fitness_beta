// const { db, admin  } = require('../Firebase/firebaseAdmin');


// // Helper to get the videos collection
// const getVideosCollection = (typeId,categoryId, exerciseId, levelId,atackId) => 
//   db.collection('types')
// .doc(typeId).collection('categories')
//     .doc(categoryId).
//     collection('exercises').
//     doc(exerciseId)
//     .collection('atack').
//     doc(atackId).
//     collection('levels').
//     doc(levelId).
//     collection('videos');



//     const getVideoCollectionInExercise = async (typeId, categoryId, exerciseId) => {
//       const videos = [];
    
//       const attacksRef = db.collection('types')
//         .doc(typeId)
//         .collection('categories')
//         .doc(categoryId)
//         .collection('exercises')
//         .doc(exerciseId)
//         .collection('atack');
    
//       const attacksSnapshot = await attacksRef.get();
    
//       for (const attackDoc of attacksSnapshot.docs) {
//         const attackId = attackDoc.id;
    
//         const levelsRef = attacksRef.doc(attackId).collection('levels');
//         const levelsSnapshot = await levelsRef.get();
    
//         for (const levelDoc of levelsSnapshot.docs) {
//           const levelId = levelDoc.id;
    
//           const videosRef = levelsRef.doc(levelId).collection('videos');
//           const videosSnapshot = await videosRef.get();
    
//           for (const videoDoc of videosSnapshot.docs) {
//             videos.push({
//               id: videoDoc.id,
//               attackId,
//               levelId,
//               ...videoDoc.data(),
//             });
//           }
//         }
//       }
    
//       return videos;
//     };
    
// // Add a video to a level Valide
// // Add a video to a level Valide
// const addVideoToLevel = async (typeId, categoryId, exerciseId, atackId, levelId, videoData) => {
//   const videosCollection = getVideosCollection(typeId, categoryId, exerciseId, levelId, atackId);
//   const videoDoc = await videosCollection.add(videoData);

//   // Create a notification with full context
//   const notificationRef = db.collection('notifications');
//   await notificationRef.add({
//     message: `A new video "${videoData.name}" has been added.`,
//     videoId: videoDoc.id,
//     typeId,
//     categoryId,
//     exerciseId,
//     levelId,
//     atackId,
//     imageUrl: videoData.imageUrl,
//     type: 'video',
//     timestamp: admin.firestore.FieldValue.serverTimestamp(),
//     isRead: false,
//   });

//   return { id: videoDoc.id, ...videoData };
// };



// // Update a video in a level Valide
// const updateVideoInLevel = async (categoryId, exerciseId,atackId, levelId, videoId, updatedData) => {
//   const videoDoc = getVideosCollection(categoryId, exerciseId, levelId,atackId).doc(videoId);
//   await videoDoc.update(updatedData);
//   const updatedVideo = await videoDoc.get();
//   return { id: updatedVideo.id, ...updatedVideo.data() };
// };

// // Get all videos in a level
// const getAllVideosInLevel = async (typeId,categoryId, exerciseId, atackId,levelId) => {
//   const snapshot = await getVideosCollection(typeId,categoryId, exerciseId, levelId,atackId).get();
//   const videos = [];
//   snapshot.forEach(doc => videos.push({ id: doc.id, ...doc.data() }));
//   return videos;
// };


// // Get a video by ID in a level
// const getVideoById = async (typeId,categoryId, exerciseId,atackId, levelId,videoId) => {
//   const videoDoc = await getVideosCollection(typeId,categoryId, exerciseId, levelId,atackId).doc(videoId).get();
//   if (!videoDoc.exists) throw new Error('Video not found');
//   return { id: videoDoc.id, ...videoDoc.data() };
// };

// // GetAllLevelsInExercices
// const getAllLevelsInExercise = async (typeId,categoryId, exerciseId,atackId) => {
//   const levelsRef = db
//   .collection('types')
//   .doc(typeId).collection('categories')
//     .doc(categoryId)
//     .collection('exercises')
//     .doc(exerciseId)
//     collection('atack')
//     .doc(atackId).
//     collection('levels');

//   const snapshot = await levelsRef.get();
//   const levels = [];
//   snapshot.forEach((doc) => {
//     levels.push({ id: doc.id, ...doc.data() });
//   });

//   return levels;
// };

// //Add level to exercice
// const addLevelToExercise = async (typeId, categoryId, exerciseId, atackId, levelData) => {
//   const levelsRef = db
//     .collection('types')
//     .doc(typeId)
//     .collection('categories')
//     .doc(categoryId)
//     .collection('exercises')
//     .doc(exerciseId)
//     .collection('atack')
//     .doc(atackId)
//     .collection('levels');

//   const newLevelRef = levelsRef.doc(); // Auto-generate ID
//   await newLevelRef.set(levelData); // Save level data
//   return { id: newLevelRef.id, ...levelData }; // Return new level with ID
// };


// const getAllVideosByL = async (typeId, categoryId, exerciseId, Level) => {
//   const atackRef = db
//     .collection('types')
//     .doc(typeId)
//     .collection('categories')
//     .doc(categoryId)
//     .collection('exercises')
//     .doc(exerciseId)
//     .collection('atack');

//   const atackSnapshot = await atackRef.get();
//   const videos = [];

//   for (const atackDoc of atackSnapshot.docs) {
//     const levelsRef = atackDoc.ref.collection('levels');
//     const levelSnapshot = await levelsRef.get();

//     for (const levelDoc of levelSnapshot.docs) {
//       const levelData = levelDoc.data();

//       if (levelData.name && levelData.name.toLowerCase() === Level.toLowerCase()) {
//         console.log(Level)

//         const videosRef = levelDoc.ref.collection('videos'); 
//         const videosSnap = await videosRef.get();
//         videosSnap.forEach(videoDoc => {
//           videos.push({
//             id: videoDoc.id,
//             ...videoDoc.data(),
//             atackId: atackDoc.id,
//             levelId: levelDoc.id
//           });
//         });

//         break; 
//       }
//     }
//   }

//   return videos;
// };

// const getAllVideosByDifficulty = async (difficulty) => {
//   try {
//     const videosSnapshot = await db.collectionGroup('videos')
//       .where('difficulty', '==', difficulty)
//       .get();

//     const allVideos = videosSnapshot.docs.map(videoDoc => ({
//       id: videoDoc.id,
//       ...videoDoc.data(),
//     }));

//     return allVideos;
//   } catch (error) {
//     console.error("Error fetching videos by difficulty:", error);
//     return [];
//   }
// };





    

// module.exports = {
//   addVideoToLevel,
//   updateVideoInLevel,
//   getAllVideosInLevel,
//   getVideoById,
//   getAllLevelsInExercise,
//   addLevelToExercise,
//   getVideoCollectionInExercise,
//   getAllVideosByL,
//   getAllVideosByDifficulty
// };












const { db, admin } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE ADAPTATIF
// ============================================
const CACHE_CONFIG = {
  levels: 12 * 60 * 60 * 1000,          // 12 heures - modifiés par admin
  videos: 24 * 60 * 60 * 1000,          // 24 heures - modifiées par admin
  'videos-filter': 12 * 60 * 60 * 1000, // 12 heures - filtres spécifiques
  'exercise-videos': 6 * 60 * 60 * 1000, // 6 heures - vidéos d'un exercice
};

const getCacheDuration = (collectionName) => {
  return CACHE_CONFIG[collectionName] || 12 * 60 * 60 * 1000; // Default 12 heures
};

// ============================================
// SYSTÈME DE CACHE
// ============================================
const cache = new Map();

const getCacheKey = (collectionName, filters = {}) => {
  return `${collectionName}_${JSON.stringify(filters)}`;
};

const isCacheValid = (cacheEntry, collectionName) => {
  if (!cacheEntry) return false;
  const duration = getCacheDuration(collectionName);
  return Date.now() - cacheEntry.timestamp < duration;
};

const invalidateCache = (collectionName = null) => {
  if (!collectionName) {
    cache.clear();
    console.log('🗑️ Cache entièrement vidé');
  } else {
    for (const key of cache.keys()) {
      if (key.startsWith(collectionName)) {
        cache.delete(key);
      }
    }
    console.log('🗑️ Cache invalidé pour:', collectionName);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper to get the videos collection
const getVideosCollection = (typeId, categoryId, exerciseId, levelId, atackId) => 
  db.collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .collection('atack')
    .doc(atackId)
    .collection('levels')
    .doc(levelId)
    .collection('videos');

// ============================================
// FONCTIONS OPTIMISÉES - LEVELS
// ============================================

// NOUVELLE: Récupère TOUS les levels avec collection group + cache
const getAllLevels = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('levels', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'levels')) {
    console.log('✅ Cache hit: getAllLevels');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all levels with collectionGroup...');
    const snapshot = await db.collectionGroup('levels').get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} levels (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error("Error fetching all levels:", error);
    return [];
  }
};

// OPTIMISÉE: Levels d'un exercice avec cache
const getAllLevelsInExercise = async (typeId, categoryId, exerciseId, atackId, forceRefresh = false) => {
  const cacheKey = getCacheKey('levels', { typeId, categoryId, exerciseId, atackId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'levels')) {
    console.log('✅ Cache hit: getAllLevelsInExercise');
    return cached.data;
  }
  
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

  const snapshot = await levelsRef.get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  console.log(`📊 Lectures: ${snapshot.size} levels (Cache: 12h)`);
  return data;
};

// Add level to exercise (avec invalidation cache)
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

  // IMPORTANT: Ajouter les IDs pour collection group
  const dataToAdd = {
    ...levelData,
    typeId,
    categorieId: categoryId,
    exerciceId: exerciseId,
    atackId,
    createdAt: new Date()
  };

  const newLevelRef = levelsRef.doc();
  await newLevelRef.set(dataToAdd);
  
  // Invalide le cache
  invalidateCache('levels');
  
  console.log('✅ Level added, cache invalidated');
  return { id: newLevelRef.id, ...dataToAdd };
};

// NOUVELLE: Recherche de levels avec filtres
const getLevelsOptimized = async (options = {}) => {
  const {
    typeId = null,
    categoryId = null,
    exerciseId = null,
    atackId = null,
    name = null,
    difficulty = null,
    limit = null,
    forceRefresh = false
  } = options;
  
  const cacheKey = getCacheKey('levels', options);
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'levels')) {
    console.log('✅ Cache hit: getLevelsOptimized');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching levels with collectionGroup and filters...');
    let query = db.collectionGroup('levels');
    
    if (typeId) query = query.where('typeId', '==', typeId);
    if (categoryId) query = query.where('categorieId', '==', categoryId);
    if (exerciseId) query = query.where('exerciceId', '==', exerciseId);
    if (atackId) query = query.where('atackId', '==', atackId);
    if (name) query = query.where('name', '==', name);
    if (difficulty) query = query.where('difficulty', '==', difficulty);
    if (limit) query = query.limit(limit);
    
    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id,
      path: doc.ref.path,
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} levels (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching levels:', error);
    return [];
  }
};

// ============================================
// FONCTIONS OPTIMISÉES - VIDEOS
// ============================================

// OPTIMISÉE: Toutes les vidéos d'un level avec cache
const getAllVideosInLevel = async (typeId, categoryId, exerciseId, atackId, levelId, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos', { typeId, categoryId, exerciseId, atackId, levelId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos')) {
    console.log('✅ Cache hit: getAllVideosInLevel');
    return cached.data;
  }
  
  const snapshot = await getVideosCollection(typeId, categoryId, exerciseId, levelId, atackId).get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  console.log(`📊 Lectures: ${snapshot.size} vidéos (Cache: 24h)`);
  return data;
};

// OPTIMISÉE: Vidéo par ID avec cache
const getVideoById = async (typeId, categoryId, exerciseId, atackId, levelId, videoId, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos', { typeId, categoryId, exerciseId, atackId, levelId, videoId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos')) {
    console.log('✅ Cache hit: getVideoById');
    return cached.data;
  }
  
  const videoDoc = await getVideosCollection(typeId, categoryId, exerciseId, levelId, atackId)
    .doc(videoId)
    .get();
  
  if (!videoDoc.exists) throw new Error('Video not found');
  
  const data = { id: videoDoc.id, ...videoDoc.data() };
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

// OPTIMISÉE: Toutes les vidéos d'un exercice avec cache
const getVideoCollectionInExercise = async (typeId, categoryId, exerciseId, forceRefresh = false) => {
  const cacheKey = getCacheKey('exercise-videos', { typeId, categoryId, exerciseId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'exercise-videos')) {
    console.log('✅ Cache hit: getVideoCollectionInExercise');
    return cached.data;
  }
  
  const videos = [];

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

    const levelsRef = attacksRef.doc(attackId).collection('levels');
    const levelsSnapshot = await levelsRef.get();

    for (const levelDoc of levelsSnapshot.docs) {
      const levelId = levelDoc.id;

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
  
  cache.set(cacheKey, {
    data: videos,
    timestamp: Date.now()
  });
  
  console.log(`📊 Lectures: ${videos.length} vidéos d'exercice (Cache: 6h)`);
  return videos;
};

// OPTIMISÉE: Vidéos par niveau de difficulté avec cache
const getAllVideosByDifficulty = async (difficulty, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-filter', { difficulty });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-filter')) {
    console.log('✅ Cache hit: getAllVideosByDifficulty', difficulty);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos by difficulty:', difficulty);
    const videosSnapshot = await db.collectionGroup('videos')
      .where('difficulty', '==', difficulty)
      .get();

    const data = videosSnapshot.docs.map(videoDoc => ({
      id: videoDoc.id,
      path: videoDoc.ref.path,
      ...videoDoc.data(),
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${videosSnapshot.size} vidéos (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error("Error fetching videos by difficulty:", error);
    return [];
  }
};

// OPTIMISÉE: Vidéos par level name avec cache
const getAllVideosByL = async (typeId, categoryId, exerciseId, Level, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-filter', { typeId, categoryId, exerciseId, Level });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-filter')) {
    console.log('✅ Cache hit: getAllVideosByL');
    return cached.data;
  }
  
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
        console.log(Level);

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
  
  cache.set(cacheKey, {
    data: videos,
    timestamp: Date.now()
  });
  
  console.log(`📊 Lectures: ${videos.length} vidéos par level (Cache: 12h)`);
  return videos;
};

// NOUVELLE: Recherche optimisée de vidéos avec filtres multiples
const getVideosOptimized = async (options = {}) => {
  const {
    typeId = null,
    categoryId = null,
    exerciseId = null,
    atackId = null,
    levelId = null,
    difficulty = null,
    duration = null,
    equipment = null,
    limit = null,
    orderBy = 'createdAt',
    orderDirection = 'desc',
    forceRefresh = false
  } = options;
  
  const cacheKey = getCacheKey('videos-filter', options);
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-filter')) {
    console.log('✅ Cache hit: getVideosOptimized');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos with collectionGroup and filters...');
    let query = db.collectionGroup('videos');
    
    if (typeId) query = query.where('typeId', '==', typeId);
    if (categoryId) query = query.where('categorieId', '==', categoryId);
    if (exerciseId) query = query.where('exerciceId', '==', exerciseId);
    if (atackId) query = query.where('atackId', '==', atackId);
    if (levelId) query = query.where('levelId', '==', levelId);
    if (difficulty) query = query.where('difficulty', '==', difficulty);
    if (duration) query = query.where('duration', '==', duration);
    if (equipment) query = query.where('equipment', '==', equipment);
    
    query = query.orderBy(orderBy, orderDirection);
    if (limit) query = query.limit(limit);
    
    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id,
      path: doc.ref.path,
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} vidéos (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// ============================================
// FONCTIONS DE MODIFICATION (avec invalidation cache)
// ============================================

// Add a video to a level (avec notification + invalidation cache)
const addVideoToLevel = async (typeId, categoryId, exerciseId, atackId, levelId, videoData) => {
  const videosCollection = getVideosCollection(typeId, categoryId, exerciseId, levelId, atackId);
  
  // IMPORTANT: Ajouter tous les IDs pour collection group
  const dataToAdd = {
    ...videoData,
    typeId,
    categorieId: categoryId,  // Utilise votre convention de nommage
    exerciceId: exerciseId,   // Utilise votre convention de nommage
    atackId,
    levelId,
    createdAt: new Date()
  };
  
  const videoDoc = await videosCollection.add(dataToAdd);

  // Create a notification with full context
  const notificationRef = db.collection('notifications');
  await notificationRef.add({
    message: `A new video "${videoData.name}" has been added.`,
    videoId: videoDoc.id,
    typeId,
    categoryId,
    exerciseId,
    levelId,
    atackId,
    imageUrl: videoData.imageUrl,
    type: 'video',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    isRead: false,
  });
  
  // Invalide le cache
  invalidateCache('videos');
  invalidateCache('exercise-videos');
  
  console.log('✅ Video added, cache invalidated');
  return { id: videoDoc.id, ...dataToAdd };
};

// Update a video in a level (avec invalidation cache)
const updateVideoInLevel = async (typeId, categoryId, exerciseId, atackId, levelId, videoId, updatedData) => {
  const videoDoc = getVideosCollection(typeId, categoryId, exerciseId, levelId, atackId).doc(videoId);
  
  await videoDoc.update({
    ...updatedData,
    updatedAt: new Date()
  });
  
  // Invalide le cache
  invalidateCache('videos');
  invalidateCache('exercise-videos');
  
  console.log('✅ Video updated, cache invalidated');
  
  const updatedVideo = await videoDoc.get();
  return { id: updatedVideo.id, ...updatedVideo.data() };
};

// NOUVELLE: Supprimer une vidéo
const deleteVideo = async (typeId, categoryId, exerciseId, atackId, levelId, videoId) => {
  await getVideosCollection(typeId, categoryId, exerciseId, levelId, atackId)
    .doc(videoId)
    .delete();
  
  // Invalide le cache
  invalidateCache('videos');
  invalidateCache('exercise-videos');
  
  console.log('✅ Video deleted, cache invalidated');
};

// ============================================
// UTILITAIRES DE MONITORING
// ============================================

const getCacheStats = () => {
  const stats = {
    totalKeys: cache.size,
    keys: [],
    totalItems: 0,
    config: CACHE_CONFIG
  };
  
  for (const [key, value] of cache.entries()) {
    const collectionName = key.split('_')[0];
    const duration = getCacheDuration(collectionName);
    const age = Date.now() - value.timestamp;
    const isValid = age < duration;
    const remainingMs = duration - age;
    
    stats.keys.push({
      key,
      collection: collectionName,
      itemCount: Array.isArray(value.data) ? value.data.length : 1,
      ageMs: age,
      remainingMs: Math.max(0, remainingMs),
      cacheDurationMs: duration,
      isValid
    });
    
    if (Array.isArray(value.data)) {
      stats.totalItems += value.data.length;
    } else {
      stats.totalItems += 1;
    }
  }
  
  return stats;
};

const clearExpiredCache = () => {
  let clearedCount = 0;
  
  for (const [key, value] of cache.entries()) {
    const collectionName = key.split('_')[0];
    if (!isCacheValid(value, collectionName)) {
      cache.delete(key);
      clearedCount++;
    }
  }
  
  console.log(`🗑️ ${clearedCount} entrées de cache expirées supprimées`);
  return clearedCount;
};

// Nettoyage automatique toutes les 6 heures
setInterval(() => {
  clearExpiredCache();
}, 6 * 60 * 60 * 1000);

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Fonctions existantes optimisées
  addVideoToLevel,
  updateVideoInLevel,
  getAllVideosInLevel,
  getVideoById,
  getAllLevelsInExercise,
  addLevelToExercise,
  getVideoCollectionInExercise,
  getAllVideosByL,
  getAllVideosByDifficulty,
  
  // Nouvelles fonctions optimisées
  getAllLevels,
  getLevelsOptimized,
  getVideosOptimized,
  deleteVideo,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};