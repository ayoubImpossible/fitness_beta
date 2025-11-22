// const { db } = require("../Firebase/firebaseAdmin");


// const PreparerExercice=db.collection('PreparerExercices')

// const addPrepareExercice = async (Data) => {
//     const ExercicePreparerDoc = await PreparerExercice.add(Data);
//     return { id: ExercicePreparerDoc.id, ...Data };
//   };


// const getPrepareExercicesByPosition = async (position) => {
//   try {
//     let query = PreparerExercice.where("position", "==", position);
//     const snapshot = await query.get();

//     if (snapshot.empty) {
//       return [];
//     }
//     return snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//   } catch (error) {
//     throw new Error("Error fetching PrepareExercices: " + error.message);
//   }
// };

// const addVideoToPrepareExercice = async (exerciceId, videoData) => {
//   try {
//     const exerciceRef = PreparerExercice.doc(exerciceId);
//     const videoRef = exerciceRef.collection("videos").doc();

//     await videoRef.set({
//       titre: videoData.titre,
//       description: videoData.description,
//       videoUrl: videoData.videoUrl,
//       imageUrl:videoData.imageUrl,
//       createdAt: new Date().toISOString(),
//     });

//     return { id: videoRef.id, ...videoData };
//   } catch (error) {
//     throw new Error("Error adding video: " + error.message);
//   }
// };


// const getVideosForPrepareExercice = async (exerciceId) => {
//   try {
//     const videosRef = PreparerExercice.doc(exerciceId).collection("videos");
//     const snapshot = await videosRef.get();

//     if (snapshot.empty) {
//       return [];
//     }
//     return snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//   } catch (error) {
//     throw new Error("Error fetching videos: " + error.message);
//   }
// };


// const getPrepareExerciceById=async(exerciceId)=>{
//   try {
//     const exerciceRef = PreparerExercice.doc(exerciceId);
//     const exerciceSnap = await exerciceRef.get();

//     if (!exerciceSnap.exists) {
//         return null;
//     }
//     return { id: exerciceSnap.id, ...exerciceSnap.data() };
// } catch (error) {
//     console.error('Error fetching prepareExercice:', error);
//     throw error;
// }
// }



// module.exports={
//   addPrepareExercice,
//   getPrepareExercicesByPosition,
//   addVideoToPrepareExercice,
//   getVideosForPrepareExercice,
//   getPrepareExerciceById}

















const { db } = require("../Firebase/firebaseAdmin");

// ============================================
// CONFIGURATION DU CACHE
// ============================================
const CACHE_CONFIG = {
  'prepare-exercices': 6 * 60 * 60 * 1000,  // 6 heures - données modifiées par admin
  'prepare-videos': 6 * 60 * 60 * 1000,     // 6 heures - vidéos
  'prepare-filter': 6 * 60 * 60 * 1000,     // 6 heures - filtres par position
};

const getCacheDuration = (collectionName) => {
  return CACHE_CONFIG[collectionName] || 6 * 60 * 60 * 1000;
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
// RÉFÉRENCES
// ============================================
const PreparerExercice = db.collection('PreparerExercices');

// ============================================
// FONCTIONS OPTIMISÉES AVEC CACHE
// ============================================

// OPTIMISÉE: Récupérer tous les exercices de préparation avec cache
const getAllPrepareExercices = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('prepare-exercices', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'prepare-exercices')) {
    console.log('✅ Cache hit: getAllPrepareExercices');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all prepare exercices...');
    const snapshot = await PreparerExercice.get();
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} exercices (Cache: 6h)`);
    return data;
  } catch (error) {
    console.error("Error fetching all prepare exercices:", error);
    throw new Error("Failed to retrieve prepare exercices");
  }
};

// OPTIMISÉE: Récupérer un exercice par ID avec cache
const getPrepareExerciceById = async (exerciceId, forceRefresh = false) => {
  const cacheKey = getCacheKey('prepare-exercices', { exerciceId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'prepare-exercices')) {
    console.log('✅ Cache hit: getPrepareExerciceById');
    return cached.data;
  }
  
  try {
    const exerciceRef = PreparerExercice.doc(exerciceId);
    const exerciceSnap = await exerciceRef.get();

    if (!exerciceSnap.exists) {
      return null;
    }
    
    const data = { id: exerciceSnap.id, ...exerciceSnap.data() };
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching prepareExercice:', error);
    throw error;
  }
};

// OPTIMISÉE: Récupérer les exercices par position avec cache
const getPrepareExercicesByPosition = async (position, forceRefresh = false) => {
  const cacheKey = getCacheKey('prepare-filter', { position });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'prepare-filter')) {
    console.log('✅ Cache hit: getPrepareExercicesByPosition', position);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching prepare exercices by position:', position);
    let query = PreparerExercice.where("position", "==", position);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }
    
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} exercices (Cache: 6h)`);
    return data;
  } catch (error) {
    throw new Error("Error fetching PrepareExercices: " + error.message);
  }
};

// OPTIMISÉE: Récupérer les vidéos d'un exercice avec cache
const getVideosForPrepareExercice = async (exerciceId, forceRefresh = false) => {
  const cacheKey = getCacheKey('prepare-videos', { exerciceId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'prepare-videos')) {
    console.log('✅ Cache hit: getVideosForPrepareExercice', exerciceId);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos for prepare exercice:', exerciceId);
    const videosRef = PreparerExercice.doc(exerciceId).collection("videos");
    const snapshot = await videosRef.get();

    if (snapshot.empty) {
      return [];
    }
    
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} vidéos (Cache: 6h)`);
    return data;
  } catch (error) {
    throw new Error("Error fetching videos: " + error.message);
  }
};

// NOUVELLE: Récupérer toutes les vidéos avec collection group
const getAllVideos = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('prepare-videos', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'prepare-videos')) {
    console.log('✅ Cache hit: getAllVideos');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all videos with collectionGroup...');
    const snapshot = await db.collectionGroup('videos')
      .where('createdAt', '!=', null) // Filtre pour ne cibler que les vidéos de PreparerExercices
      .get();
    
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      path: doc.ref.path,
      exerciceId: doc.ref.parent.parent.id, // ID du parent exercice
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} vidéos (Cache: 6h)`);
    return data;
  } catch (error) {
    console.error("Error fetching all videos:", error);
    throw new Error("Failed to retrieve videos");
  }
};

// ============================================
// FONCTIONS DE MODIFICATION (avec invalidation cache)
// ============================================

// OPTIMISÉE: Ajouter un exercice de préparation
const addPrepareExercice = async (Data) => {
  const ExercicePreparerDoc = await PreparerExercice.add({
    ...Data,
    createdAt: new Date()
  });
  
  // Invalide le cache
  invalidateCache('prepare-exercices');
  invalidateCache('prepare-filter');
  
  console.log('✅ Prepare exercice added, cache invalidated');
  return { id: ExercicePreparerDoc.id, ...Data };
};

// OPTIMISÉE: Mettre à jour un exercice de préparation
const updatePrepareExercice = async (exerciceId, updatedData) => {
  const exerciceRef = PreparerExercice.doc(exerciceId);
  
  await exerciceRef.update({
    ...updatedData,
    updatedAt: new Date()
  });
  
  // Invalide le cache
  invalidateCache('prepare-exercices');
  invalidateCache('prepare-filter');
  
  console.log('✅ Prepare exercice updated, cache invalidated');
};

// OPTIMISÉE: Supprimer un exercice de préparation
const deletePrepareExercice = async (exerciceId) => {
  // Supprimer d'abord toutes les vidéos
  const videosRef = PreparerExercice.doc(exerciceId).collection("videos");
  const videosSnapshot = await videosRef.get();
  
  const batch = db.batch();
  videosSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Supprimer l'exercice
  batch.delete(PreparerExercice.doc(exerciceId));
  await batch.commit();
  
  // Invalide le cache
  invalidateCache('prepare-exercices');
  invalidateCache('prepare-filter');
  invalidateCache('prepare-videos');
  
  console.log('✅ Prepare exercice deleted, cache invalidated');
};

// OPTIMISÉE: Ajouter une vidéo à un exercice
const addVideoToPrepareExercice = async (exerciceId, videoData) => {
  try {
    const exerciceRef = PreparerExercice.doc(exerciceId);
    const videoRef = exerciceRef.collection("videos").doc();

    await videoRef.set({
      titre: videoData.titre,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      imageUrl: videoData.imageUrl,
      exerciceId: exerciceId, // Ajouter pour collection group
      createdAt: new Date(),
    });
    
    // Invalide le cache des vidéos
    invalidateCache('prepare-videos');
    
    console.log('✅ Video added, cache invalidated');
    return { id: videoRef.id, ...videoData };
  } catch (error) {
    throw new Error("Error adding video: " + error.message);
  }
};

// OPTIMISÉE: Mettre à jour une vidéo
const updateVideoInPrepareExercice = async (exerciceId, videoId, updatedData) => {
  const videoRef = PreparerExercice.doc(exerciceId).collection("videos").doc(videoId);
  
  await videoRef.update({
    ...updatedData,
    updatedAt: new Date()
  });
  
  // Invalide le cache des vidéos
  invalidateCache('prepare-videos');
  
  console.log('✅ Video updated, cache invalidated');
};

// OPTIMISÉE: Supprimer une vidéo
const deleteVideoFromPrepareExercice = async (exerciceId, videoId) => {
  await PreparerExercice.doc(exerciceId).collection("videos").doc(videoId).delete();
  
  // Invalide le cache des vidéos
  invalidateCache('prepare-videos');
  
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
  
  if (clearedCount > 0) {
    console.log(`🗑️ ${clearedCount} entrées de cache expirées supprimées`);
  }
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
  // Fonctions originales optimisées
  addPrepareExercice,
  getPrepareExercicesByPosition,
  addVideoToPrepareExercice,
  getVideosForPrepareExercice,
  getPrepareExerciceById,
  
  // Nouvelles fonctions optimisées
  getAllPrepareExercices,
  getAllVideos,
  updatePrepareExercice,
  deletePrepareExercice,
  updateVideoInPrepareExercice,
  deleteVideoFromPrepareExercice,
  
  // Utilitaires
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};