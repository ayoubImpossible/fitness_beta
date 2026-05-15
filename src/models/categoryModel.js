

const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE ADAPTATIF - MODE ADMIN
// ============================================
const CACHE_CONFIG = {
  categories: 24 * 60 * 60 * 1000,  // 24 heures - modifiées par admin seulement
  exercises: 12 * 60 * 60 * 1000,   // 12 heures - modifiées par admin seulement
  videos: 24 * 60 * 60 * 1000,      // 24 heures - modifiées par admin seulement
  userProgress: 5 * 60 * 1000,      // 5 minutes - modifié par les utilisateurs
  settings: 7 * 24 * 60 * 60 * 1000, // 7 jours - changent très rarement
  'category-full': 12 * 60 * 60 * 1000, // 12 heures - données imbriquées complexes
  'video-count': 24 * 60 * 60 * 1000,   // 24 heures - compte rarement modifié
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
// RÉFÉRENCES (gardées pour compatibilité)
// ============================================
const categoryRef = db.collection('categories');
const typesRef = db.collection('types');
const categorieRef = (typeId) => db.collection('types').doc(typeId).collection('categories');

// ============================================
// FONCTIONS OPTIMISÉES AVEC COLLECTION GROUP
// ============================================

// NOUVELLE: Récupère TOUTES les catégories avec collection group + cache
const getAllCat = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('categories', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'categories')) {
    console.log('✅ Cache hit: getAllCat');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all categories with collectionGroup...');
    
    // AVANT: Boucle sur tous les types (N lectures)
    // APRÈS: Une seule requête collection group
    const snapshot = await db.collectionGroup('categories').get();
    const allCategories = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data: allCategories,
      timestamp: Date.now()
    });
    
    console.log(`📊 Lectures: ${snapshot.size} documents (Cache: 24h)`);
    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// AMÉLIORÉE: Récupère les catégories d'un type spécifique avec cache
const getAllCategories = async (typeId, forceRefresh = false) => {
  const cacheKey = getCacheKey('categories', { typeId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'categories')) {
    console.log('✅ Cache hit: getAllCategories', typeId);
    return cached.data;
  }
  
  console.log('📥 Fetching categories for type:', typeId);
  const snapshot = await categorieRef(typeId).get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  console.log(`📊 Lectures: ${snapshot.size} documents (Cache: 24h)`);
  return data;
};

// NOUVELLE: Version optimisée avec collection group et filtres multiples
const getCategoriesOptimized = async (options = {}) => {
  const {
    typeId = null,
    status = null,
    limit = null,
    orderBy = 'createdAt',
    orderDirection = 'desc',
    forceRefresh = false
  } = options;
  
  const cacheKey = getCacheKey('categories', options);
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'categories')) {
    console.log('✅ Cache hit: getCategoriesOptimized');
    return cached.data;
  }
  
  console.log('📥 Fetching with collectionGroup and filters...');
  let query = db.collectionGroup('categories');
  
  if (typeId) query = query.where('typeId', '==', typeId);
  if (status) query = query.where('status', '==', status);
  
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
  
  console.log(`📊 Lectures: ${snapshot.size} documents (Cache: 24h)`);
  return data;
};

// ============================================
// FONCTIONS EXISTANTES (avec invalidation cache)
// ============================================

// Add a new category
const addCategory = async (typeId, categoryData) => {
  const typeRef = db.collection('types').doc(typeId);
  const categoryRef = typeRef.collection('categories');

  // IMPORTANT: Ajouter typeId pour collection group
  const dataToAdd = {
    ...categoryData,
    typeId, // Nécessaire pour filtrer avec collection group
    createdAt: new Date()
  };

  const categoryDoc = await categoryRef.add(dataToAdd);
  
  // Invalide le cache après ajout
  invalidateCache('categories');
  
  console.log('✅ Category added, cache invalidated');
  return { id: categoryDoc.id, ...dataToAdd };
};

// Get category by ID (simple)
const getCategoryById = async (id) => {
  const categoryDoc = await categoryRef.doc(id).get();
  if (!categoryDoc.exists) throw new Error('Category not found');
  return { id: categoryDoc.id, ...categoryDoc.data() };
};

// Get category by ID dans un type spécifique
const getCategory = async (typeId, categoryId) => {
  const doc = await categorieRef(typeId).doc(categoryId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Update a category
const updateCategory = async (id, updatedData) => {
  const categoryDoc = categoryRef.doc(id);
  await categoryDoc.update({
    ...updatedData,
    updatedAt: new Date()
  });
  
  // Invalide le cache après mise à jour
  invalidateCache('categories');
  
  console.log('✅ Category updated, cache invalidated');
  const updatedCategory = await categoryDoc.get();
  return { id: updatedCategory.id, ...updatedCategory.data() };
};

// Update category in type
const updateCategoryInType = async (typeId, categoryId, updatedData) => {
  const categorieRef = db.collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId);
  
  await categorieRef.update({
    ...updatedData,
    typeId, // S'assure que typeId est toujours présent
    updatedAt: new Date()
  });
  
  // Invalide le cache
  invalidateCache('categories');
  
  console.log('✅ Category updated in type, cache invalidated');
};

// Delete a category
const deleteCategory = async (id) => {
  await categoryRef.doc(id).delete();
  
  // Invalide le cache après suppression
  invalidateCache('categories');
  
  console.log('✅ Category deleted, cache invalidated');
};

// ============================================
// FONCTIONS COMPLEXES (avec cache adaptatif)
// ============================================

const getCategoryWithExercisesLevelsAndVideos = async (typeId, categoryId, forceRefresh = false) => {
  const cacheKey = getCacheKey('category-full', { typeId, categoryId });
  const cached = cache.get(cacheKey);
  
  // Cache plus court car données imbriquées complexes
  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getCategoryWithExercisesLevelsAndVideos');
    return cached.data;
  }
  
  const categoryRef = db.collection('types').doc(typeId).collection('categories').doc(categoryId);
  const categorySnapshot = await categoryRef.get();

  if (!categorySnapshot.exists) {
    throw new Error('Category not found');
  }

  const categoryData = categorySnapshot.data();

  const exercisesSnapshot = await categoryRef.collection('exercises').get();
  const exercises = await Promise.all(exercisesSnapshot.docs.map(async (exerciseDoc) => {
    const exerciseData = exerciseDoc.data();
    const levelsSnapshot = await exerciseDoc.ref.collection('levels').get();
    const levels = await Promise.all(levelsSnapshot.docs.map(async (levelDoc) => {
      const levelData = levelDoc.data();
      const videosSnapshot = await levelDoc.ref.collection('videos').get();
      const videos = videosSnapshot.docs.map(videoDoc => ({
        id: videoDoc.id,
        ...videoDoc.data(),
      }));
      return {
        id: levelDoc.id,
        ...levelData,
        videos,
      };
    }));
    return {
      id: exerciseDoc.id,
      ...exerciseData,
      levels,
    };
  }));

  const result = {
    id: categorySnapshot.id,
    ...categoryData,
    exercises,
  };
  
  // Cache ce résultat complexe
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  console.log(`📊 Catégorie complète récupérée (Cache: 12h)`);
  return result;
};

const getVideoCountByCategoryId = async (categoryId, forceRefresh = false) => {
  const cacheKey = getCacheKey('video-count', { categoryId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'videos')) {
    console.log('✅ Cache hit: getVideoCountByCategoryId');
    return cached.data;
  }
  
  try {
    // BEFORE: 6 nested loops (types → categories → exercises → atacks → levels → videos) = ~35 reads
    // AFTER:  single collectionGroup query filtered by categorieId = 1 read
    const videosSnapshot = await db.collectionGroup('videos')
      .where('categorieId', '==', categoryId)
      .get();

    const result = {
      categoryId,
      videoCount: videosSnapshot.size
    };
    
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`📊 Video count: ${result.videoCount} (Cache: 24h)`);
    return result;
  } catch (error) {
    console.error('Error counting videos:', error);
    throw error;
  }
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

// Nettoyage automatique toutes les 6 heures (car cache longue durée)
setInterval(() => {
  clearExpiredCache();
}, 6 * 60 * 60 * 1000);

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Fonctions existantes
  addCategory,
  getCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  updateCategoryInType,
  getCategoryWithExercisesLevelsAndVideos,
  getAllCat,
  getVideoCountByCategoryId,
  
  // Nouvelles fonctions optimisées
  getCategoriesOptimized,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};