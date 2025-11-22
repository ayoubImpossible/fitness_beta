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






const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE ADAPTATIF
// ============================================
const CACHE_CONFIG = {
  videos: 24 * 60 * 60 * 1000,          // 24 heures - modifiées par admin seulement
  'videos-filter': 12 * 60 * 60 * 1000, // 12 heures - filtres spécifiques
  'videos-metadata': 7 * 24 * 60 * 60 * 1000, // 7 jours - equipment/durations types (rarement modifiés)
};

const getCacheDuration = (collectionName) => {
  return CACHE_CONFIG[collectionName] || 24 * 60 * 60 * 1000; // Default 24 heures
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
// FONCTIONS OPTIMISÉES AVEC CACHE
// ============================================

// OPTIMISÉE: Toutes les vidéos avec cache 24h
const getAllVid = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('videos', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos')) {
    console.log('✅ Cache hit: getAllVid');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all videos with collectionGroup...');
    const videosSnapshot = await db.collectionGroup("videos").get();

    if (videosSnapshot.empty) {
      console.log("No videos found");
      return [];
    }
    
    const data = videosSnapshot.docs.map((doc) => {
      const videoData = doc.data();
      const pathParts = doc.ref.path.split("/");
      const categoryIndex = pathParts.indexOf("categories");
      const category = categoryIndex !== -1 ? pathParts[categoryIndex + 1] : "uncategorized";

      return {
        id: doc.id,
        path: doc.ref.path,
        category, 
        ...videoData,
      };
    });
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${videosSnapshot.size} vidéos (Cache: 24h)`);
    return data;
  } catch (error) {
    console.error("Error fetching all videos:", error);
    return [];
  }
};

// OPTIMISÉE: Vidéos par durée avec cache 12h
const getAllVideosByDuration = async (duration, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-filter', { duration });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-filter')) {
    console.log('✅ Cache hit: getAllVideosByDuration', duration);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos by duration:', duration);
    const videosSnapshot = await db.collectionGroup("videos")
      .where("duration", "==", duration)
      .get();

    const data = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${videosSnapshot.size} vidéos (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error("Error fetching videos by duration:", error);
    return [];
  }
};

// OPTIMISÉE: Vidéos par équipement avec cache 12h
const getAllVideosByeq = async (equipment, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-filter', { equipment });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-filter')) {
    console.log('✅ Cache hit: getAllVideosByeq', equipment);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos by equipment:', equipment);
    const videosSnapshot = await db.collectionGroup("videos")
      .where("equipment", "==", equipment)
      .get();

    const data = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${videosSnapshot.size} vidéos (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error("Error fetching videos by equipment:", error);
    return [];
  }
};

// OPTIMISÉE: Vidéos par niveau de difficulté avec cache 12h
const getAllVideosBylevel = async (difficulty, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-filter', { difficulty });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-filter')) {
    console.log('✅ Cache hit: getAllVideosBylevel', difficulty);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos by difficulty:', difficulty);
    const videosSnapshot = await db.collectionGroup("videos")
      .where("difficulty", "==", difficulty)
      .get();

    const data = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
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

// OPTIMISÉE: Types d'équipement par exercice avec cache 7 jours
const getAllEquipmentTypes = async (exerciceId, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-metadata', { equipmentTypes: true, exerciceId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-metadata')) {
    console.log('✅ Cache hit: getAllEquipmentTypes', exerciceId);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching equipment types for exercise:', exerciceId);
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

    const result = Array.from(equipmentSet);
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`📊 Equipment types: ${result.length} types (Cache: 7 jours)`);
    return result;
  } catch (error) {
    console.error("Error fetching equipment types:", error);
    throw error;
  }
};

// OPTIMISÉE: Tous les types d'équipement avec cache 7 jours
const getAllEquipmentTypes_2 = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-metadata', { allEquipmentTypes: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-metadata')) {
    console.log('✅ Cache hit: getAllEquipmentTypes_2');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all equipment types...');
    const snapshot = await db.collectionGroup('videos').get(); 
    const equipmentSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.equipment) {
        equipmentSet.add(data.equipment);
      }
    });

    const result = Array.from(equipmentSet);
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`📊 All equipment types: ${result.length} types (Cache: 7 jours)`);
    return result;
  } catch (error) {
    console.error('Error fetching all equipment types:', error);
    throw error;
  }
};

// OPTIMISÉE: Tous les types de difficulté avec cache 7 jours
const getAllDurationsTypes_2 = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-metadata', { allDifficultyTypes: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-metadata')) {
    console.log('✅ Cache hit: getAllDurationsTypes_2');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all difficulty types...');
    const snapshot = await db.collectionGroup('videos').get();  
    const durationSet = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.difficulty) {
        durationSet.add(data.difficulty);
      }
    });

    const result = Array.from(durationSet);
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`📊 All difficulty types: ${result.length} types (Cache: 7 jours)`);
    return result;
  } catch (error) {
    console.error('Error fetching all difficulty types:', error);
    throw error;
  }
};

// OPTIMISÉE: Durées par exercice avec cache 7 jours
const getAllDurationsTypes = async (exerciceId, forceRefresh = false) => {
  const cacheKey = getCacheKey('videos-metadata', { durationTypes: true, exerciceId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos-metadata')) {
    console.log('✅ Cache hit: getAllDurationsTypes', exerciceId);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching duration types for exercise:', exerciceId);
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

    const result = Array.from(durationSet);
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`📊 Duration types: ${result.length} types (Cache: 7 jours)`);
    return result;
  } catch (error) {
    console.error("Error fetching durations:", error);
    throw error;
  }
};

// ============================================
// NOUVELLE FONCTION: Recherche avancée avec filtres multiples
// ============================================

const getVideosOptimized = async (options = {}) => {
  const {
    exerciceId = null,
    categoryId = null,
    duration = null,
    equipment = null,
    difficulty = null,
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
    console.log('📥 Fetching videos with multiple filters...');
    let query = db.collectionGroup('videos');
    
    // Applique tous les filtres disponibles
    if (exerciceId) query = query.where('exerciceId', '==', exerciceId);
    if (categoryId) query = query.where('categorieId', '==', categoryId);
    if (duration) query = query.where('duration', '==', duration);
    if (equipment) query = query.where('equipment', '==', equipment);
    if (difficulty) query = query.where('difficulty', '==', difficulty);
    
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
    console.error('Error fetching videos with filters:', error);
    return [];
  }
};

// ============================================
// FONCTIONS DE MODIFICATION (avec invalidation cache)
// ============================================

const addVideo = async (videoPath, videoData) => {
  // videoPath exemple: 'types/typeId/categories/catId/exercises/exId/levels/lvlId/videos'
  const videoRef = db.doc(videoPath).collection('videos');
  
  const dataToAdd = {
    ...videoData,
    createdAt: new Date()
  };
  
  const videoDoc = await videoRef.add(dataToAdd);
  
  // Invalide tous les caches vidéos
  invalidateCache('videos');
  
  console.log('✅ Video added, cache invalidated');
  return videoDoc.id;
};

const updateVideo = async (videoPath, videoId, updatedData) => {
  const videoRef = db.doc(videoPath).collection('videos').doc(videoId);
  
  await videoRef.update({
    ...updatedData,
    updatedAt: new Date()
  });
  
  // Invalide tous les caches vidéos
  invalidateCache('videos');
  
  console.log('✅ Video updated, cache invalidated');
};

const deleteVideo = async (videoPath, videoId) => {
  await db.doc(videoPath).collection('videos').doc(videoId).delete();
  
  // Invalide tous les caches vidéos
  invalidateCache('videos');
  
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

// Nettoyage automatique toutes les 12 heures
setInterval(() => {
  clearExpiredCache();
}, 12 * 60 * 60 * 1000);

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Fonctions existantes optimisées
  getAllEquipmentTypes,
  getAllDurationsTypes,
  getAllVid,
  getAllVideosBylevel,
  getAllDurationsTypes_2,
  getAllEquipmentTypes_2,
  getAllVideosByDuration,
  getAllVideosByeq,
  
  // Nouvelles fonctions
  getVideosOptimized,
  addVideo,
  updateVideo,
  deleteVideo,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};