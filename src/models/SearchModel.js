// const { db } = require('../Firebase/firebaseAdmin');

// const searchVideosByName = async (searchTerm) => {
//   const lowerSearchTerm = searchTerm.toLowerCase();
//   const matchedVideos = [];

//   try {
//     const typesSnapshot = await db.collection('types').get();

//     await Promise.all(typesSnapshot.docs.map(async (typeDoc) => {
//       const categoriesSnapshot = await typeDoc.ref.collection('categories').get();

//       await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
//         const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();

//         await Promise.all(exercisesSnapshot.docs.map(async (exerciseDoc) => {
//           const atackSnapshot = await exerciseDoc.ref.collection('atack').get();

//           await Promise.all(atackSnapshot.docs.map(async (atackDoc) => {
//             const levelsSnapshot = await atackDoc.ref.collection('levels').get();

//             await Promise.all(levelsSnapshot.docs.map(async (levelDoc) => {
//               const videosSnapshot = await levelDoc.ref.collection('videos').get();

//               videosSnapshot.docs.forEach((videoDoc) => {
//                 const videoData = videoDoc.data();
//                 const videoName = videoData.name?.toLowerCase() || '';

//                 if (videoName.includes(lowerSearchTerm)) {
//                   matchedVideos.push({
//                     id: videoDoc.id,
//                     ...videoData,
//                   });
//                 }
//               });
//             }));
//           }));
//         }));
//       }));
//     }));

//     if (matchedVideos.length === 0) {
//       console.log("No matching videos found.");
//     }

//     return matchedVideos;
//   } catch (error) {
//     console.error('Error searching videos by name:', error);
//     return [];
//   }
// };

// module.exports = { searchVideosByName };

















const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE
// ============================================
const CACHE_CONFIG = {
  'all-videos': 12 * 60 * 60 * 1000,      // 12 heures
  'video-search': 6 * 60 * 60 * 1000,     // 6 heures
};

const getCacheDuration = (collectionName) => {
  return CACHE_CONFIG[collectionName] || 12 * 60 * 60 * 1000;
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
// FONCTIONS OPTIMISÉES
// ============================================

const getAllVideosWithMetadata = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('all-videos', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'all-videos')) {
    console.log('✅ Cache hit: getAllVideosWithMetadata');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all videos with collectionGroup...');
    const videosSnapshot = await db.collectionGroup('videos').get();
    
    const allVideos = videosSnapshot.docs.map(doc => {
      const path = doc.ref.path;
      const pathParts = path.split('/');
      
      return {
        id: doc.id,
        path: doc.ref.path,
        typeId: pathParts[1] || null,
        categoryId: pathParts[3] || null,
        exerciseId: pathParts[5] || null,
        atackId: pathParts[7] || null,
        levelId: pathParts[9] || null,
        ...doc.data()
      };
    });
    
    cache.set(cacheKey, {
      data: allVideos,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${videosSnapshot.size} vidéos (Cache: 12h)`);
    return allVideos;
  } catch (error) {
    console.error("Error fetching all videos:", error);
    throw new Error("Failed to retrieve videos");
  }
};

const searchVideosByName = async (searchTerm, forceRefresh = false) => {
  const cacheKey = getCacheKey('video-search', { searchTerm: searchTerm.toLowerCase() });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'video-search')) {
    console.log('✅ Cache hit: searchVideosByName', searchTerm);
    return cached.data;
  }
  
  try {
    console.log('🔍 Searching for:', searchTerm);
    const allVideos = await getAllVideosWithMetadata(forceRefresh);
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchedVideos = allVideos.filter(video => {
      const videoName = video.name?.toLowerCase() || '';
      return videoName.includes(lowerSearchTerm);
    });
    
    cache.set(cacheKey, {
      data: matchedVideos,
      timestamp: Date.now()
    });
    
    console.log(`✅ Found ${matchedVideos.length} videos`);
    
    if (matchedVideos.length === 0) {
      console.log("No matching videos found.");
    }
    
    return matchedVideos;
  } catch (error) {
    console.error('Error searching videos by name:', error);
    return [];
  }
};

// ============================================
// UTILITAIRES
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
  searchVideosByName,
  getAllVideosWithMetadata,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};