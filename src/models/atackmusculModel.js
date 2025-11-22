// const { db } = require('../Firebase/firebaseAdmin');

// const categoriesRef = (typeId) => db.collection('types').doc(typeId).collection('categories');



// const getAllAtacks = async (typeId,categoryId,exerciceId) => {
//   const snapshot = await categoriesRef(typeId).doc(categoryId).
//   collection('exercises').doc(exerciceId).collection('atack').get();

//   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };


// const getAllAtacks_2 = async () => {
//   try {
//     const snapshot = await db.collectionGroup('atack').get(); // Fetch all atacks from all exercises
//     const atacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     return atacks;
//   } catch (error) {
//     console.error("Error fetching all atacks:", error);
//     throw new Error("Failed to retrieve atacks");
//   }
// };


// // Get an exercise by ID old
// const getAtackById = async (typeId,categoryId, exerciseId,atackId) => {
//   const doc = await categoriesRef(typeId).doc(categoryId).
//   collection('exercises').doc(exerciseId).collection('atack').doc(atackId).get();

//   return doc.exists ? { id: doc.id, ...doc.data() } : null;
// };
// // Add a new exercise
// const addAtack_To_Exercice= async (typeId,categoryId,exerciceId, atackData) => {
//   const typeRef = db.collection('types').doc(typeId);
//   const categoryRef = typeRef.collection('categories').doc(categoryId);
//   const atackRef = categoryRef.collection('exercises').doc(exerciceId).
//   collection('atack') ;
//   // Add a new document in the exercises subcollection
//   const atackDoc = await atackRef.add(atackData);
  
//   return atackDoc.id; // Return the new exercise's ID
// };
// // Function to update an exercise in a specific category
// const update_Atack_In_Exercice = async (typeId,categoryId, exerciseId,atackId, updatedData) => {
//   const atackRef = db.collection('types')
//                         .doc(typeId)
//                         .collection('categories')
//                         .doc(categoryId)
//                         .collection('exercises')
//                         .doc(exerciseId).
//                         collection('atack').
//                         doc(atackId);

//   await atackRef.update(updatedData);
// };
// // Supprime un exercice par ID
// const delete_Atack_From_Database = async (typeId,categoryId,exerciseId,atackId) => {
//   await  db.collection('types')
//   .doc(typeId)
//   .collection('categories')
//   .doc(categoryId).
//   collection('exercises')
//   .doc(exerciseId)
//   .collection('atack')
//   .doc(atackId).
//   delete();
// };


// const getVideosByMuscleAttack = async (muscleAttack) => {
//   try {
//     // 1️⃣ Get all atack docs matching the muscleAttack
//     const atackSnapshot = await db.collectionGroup('atack')
//       .where('muscleAttack', '==', muscleAttack)
//       .get();

//     if (atackSnapshot.empty) return [];

//     // 2️⃣ Collect all atack IDs
//     const atackIds = atackSnapshot.docs.map(doc => doc.id);

//     // 3️⃣ Query videos by atackId (across all levels)
//     const videosSnapshot = await db.collectionGroup('videos')
//       .where('atackId', 'in', atackIds) // Firestore 'in' supports max 10 IDs, see note below
//       .get();

//     const allVideos = videosSnapshot.docs.map(videoDoc => ({
//       id: videoDoc.id,
//       ...videoDoc.data(),
//     }));

//     return allVideos;
//   } catch (error) {
//     console.error('Error fetching videos by muscleAttack:', error);
//     return [];
//   }
// };



// module.exports = 
//                { 
//                 getAllAtacks,
//                 getAtackById,
//                 addAtack_To_Exercice,
//                 update_Atack_In_Exercice,
//                 delete_Atack_From_Database,
//                 getAllAtacks_2,
//                 getVideosByMuscleAttack
//             };







const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE
// ============================================
const CACHE_CONFIG = {
  atacks: 12 * 60 * 60 * 1000,          // 12 heures - modifiés par admin
  'atacks-filter': 12 * 60 * 60 * 1000, // 12 heures - filtres
  'muscle-videos': 6 * 60 * 60 * 1000,  // 6 heures - vidéos par muscle
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
// RÉFÉRENCES
// ============================================
const categoriesRef = (typeId) => db.collection('types').doc(typeId).collection('categories');

// ============================================
// FONCTIONS OPTIMISÉES AVEC CACHE
// ============================================

// OPTIMISÉE: Récupère tous les atacks d'un exercice avec cache
const getAllAtacks = async (typeId, categoryId, exerciceId, forceRefresh = false) => {
  const cacheKey = getCacheKey('atacks', { typeId, categoryId, exerciceId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'atacks')) {
    console.log('✅ Cache hit: getAllAtacks');
    return cached.data;
  }
  
  console.log('📥 Fetching atacks for exercise:', exerciceId);
  const snapshot = await categoriesRef(typeId)
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciceId)
    .collection('atack')
    .get();

  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  console.log(`📊 Lectures: ${snapshot.size} atacks (Cache: 12h)`);
  return data;
};

// OPTIMISÉE: Récupère TOUS les atacks avec collection group + cache
const getAllAtacks_2 = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('atacks', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'atacks')) {
    console.log('✅ Cache hit: getAllAtacks_2');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all atacks with collectionGroup...');
    const snapshot = await db.collectionGroup('atack').get();
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      path: doc.ref.path,
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} atacks (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error("Error fetching all atacks:", error);
    throw new Error("Failed to retrieve atacks");
  }
};

// OPTIMISÉE: Récupère un atack par ID avec cache
const getAtackById = async (typeId, categoryId, exerciseId, atackId, forceRefresh = false) => {
  const cacheKey = getCacheKey('atacks', { typeId, categoryId, exerciseId, atackId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'atacks')) {
    console.log('✅ Cache hit: getAtackById');
    return cached.data;
  }
  
  const doc = await categoriesRef(typeId)
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .collection('atack')
    .doc(atackId)
    .get();

  const data = doc.exists ? { id: doc.id, ...doc.data() } : null;
  
  if (data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  return data;
};

// OPTIMISÉE: Récupère les vidéos par muscle attack avec cache
const getVideosByMuscleAttack = async (muscleAttack, forceRefresh = false) => {
  const cacheKey = getCacheKey('muscle-videos', { muscleAttack });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'muscle-videos')) {
    console.log('✅ Cache hit: getVideosByMuscleAttack', muscleAttack);
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos by muscleAttack:', muscleAttack);
    
    // 1️⃣ Get all atack docs matching the muscleAttack
    const atackSnapshot = await db.collectionGroup('atack')
      .where('muscleAttack', '==', muscleAttack)
      .get();

    if (atackSnapshot.empty) {
      console.log('No atacks found for:', muscleAttack);
      return [];
    }

    // 2️⃣ Collect all atack IDs
    const atackIds = atackSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${atackIds.length} atacks`);

    // 3️⃣ Query videos by atackId (Firestore 'in' supports max 10 IDs)
    // Si plus de 10 atackIds, faire plusieurs requêtes
    const allVideos = [];
    
    // Découpe en chunks de 10 (limite Firestore)
    for (let i = 0; i < atackIds.length; i += 10) {
      const chunk = atackIds.slice(i, i + 10);
      
      const videosSnapshot = await db.collectionGroup('videos')
        .where('atackId', 'in', chunk)
        .get();

      const videos = videosSnapshot.docs.map(videoDoc => ({
        id: videoDoc.id,
        path: videoDoc.ref.path,
        ...videoDoc.data(),
      }));
      
      allVideos.push(...videos);
    }
    
    cache.set(cacheKey, {
      data: allVideos,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${allVideos.length} vidéos (Cache: 6h)`);
    return allVideos;
  } catch (error) {
    console.error('Error fetching videos by muscleAttack:', error);
    return [];
  }
};

// NOUVELLE: Recherche d'atacks avec filtres
const getAtacksOptimized = async (options = {}) => {
  const {
    typeId = null,
    categoryId = null,
    exerciceId = null,
    muscleAttack = null,
    difficulty = null,
    limit = null,
    forceRefresh = false
  } = options;
  
  const cacheKey = getCacheKey('atacks-filter', options);
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'atacks-filter')) {
    console.log('✅ Cache hit: getAtacksOptimized');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching atacks with filters...');
    let query = db.collectionGroup('atack');
    
    if (typeId) query = query.where('typeId', '==', typeId);
    if (categoryId) query = query.where('categorieId', '==', categoryId);
    if (exerciceId) query = query.where('exerciceId', '==', exerciceId);
    if (muscleAttack) query = query.where('muscleAttack', '==', muscleAttack);
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
    
    console.log(`📊 Lectures: ${snapshot.size} atacks (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching atacks:', error);
    return [];
  }
};

// ============================================
// FONCTIONS DE MODIFICATION (avec invalidation cache)
// ============================================

// OPTIMISÉE: Ajouter un atack
const addAtack_To_Exercice = async (typeId, categoryId, exerciceId, atackData) => {
  const typeRef = db.collection('types').doc(typeId);
  const categoryRef = typeRef.collection('categories').doc(categoryId);
  const atackRef = categoryRef.collection('exercises').doc(exerciceId).collection('atack');
  
  // IMPORTANT: Ajouter les IDs pour collection group
  const dataToAdd = {
    ...atackData,
    typeId,
    categorieId: categoryId,
    exerciceId: exerciceId,
    createdAt: new Date()
  };
  
  const atackDoc = await atackRef.add(dataToAdd);
  
  // Invalide le cache
  invalidateCache('atacks');
  invalidateCache('muscle-videos'); // Les vidéos par muscle peuvent changer
  
  console.log('✅ Atack added, cache invalidated');
  return atackDoc.id;
};

// OPTIMISÉE: Mettre à jour un atack
const update_Atack_In_Exercice = async (typeId, categoryId, exerciseId, atackId, updatedData) => {
  const atackRef = db.collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .collection('atack')
    .doc(atackId);

  await atackRef.update({
    ...updatedData,
    updatedAt: new Date()
  });
  
  // Invalide le cache
  invalidateCache('atacks');
  invalidateCache('muscle-videos');
  
  console.log('✅ Atack updated, cache invalidated');
};

// OPTIMISÉE: Supprimer un atack
const delete_Atack_From_Database = async (typeId, categoryId, exerciseId, atackId) => {
  await db.collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .collection('atack')
    .doc(atackId)
    .delete();
  
  // Invalide le cache
  invalidateCache('atacks');
  invalidateCache('muscle-videos');
  
  console.log('✅ Atack deleted, cache invalidated');
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
  // Fonctions existantes optimisées
  getAllAtacks,
  getAtackById,
  addAtack_To_Exercice,
  update_Atack_In_Exercice,
  delete_Atack_From_Database,
  getAllAtacks_2,
  getVideosByMuscleAttack,
  
  // Nouvelles fonctions optimisées
  getAtacksOptimized,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};