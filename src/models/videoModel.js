




const { db } = require("../Firebase/firebaseAdmin");

// ============================================
// CONFIGURATION DU CACHE
// ============================================
const CACHE_CONFIG = {
  'all-videos': 12 * 60 * 60 * 1000,      // 12 heures
  'filtered-videos': 6 * 60 * 60 * 1000,  // 6 heures
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

const getFilteredVideos = async (muscle, level, forceRefresh = false) => {
  const cacheKey = getCacheKey('filtered-videos', { muscle, level });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'filtered-videos')) {
    console.log('✅ Cache hit: getFilteredVideos', { muscle, level });
    return cached.data;
  }
  
  try {
    console.log('🔍 Filtering videos:', { muscle, level });
    const allVideos = await getAllVideosWithMetadata(forceRefresh);
    
    const filteredVideos = allVideos.filter(video => {
      let matches = true;
      
      if (muscle && video.category !== muscle) {
        matches = false;
      }
      
      if (level && video.difficulty !== level) {
        matches = false;
      }
      
      return matches;
    });
    
    cache.set(cacheKey, {
      data: filteredVideos,
      timestamp: Date.now()
    });
    
    console.log(`✅ Found ${filteredVideos.length} filtered videos`);
    return filteredVideos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
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
  getFilteredVideos,
  getAllVideosWithMetadata,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};