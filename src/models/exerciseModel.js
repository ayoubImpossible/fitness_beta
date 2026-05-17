


const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE ADAPTATIF
// ============================================
const CACHE_CONFIG = {
  exercises: 12 * 60 * 60 * 1000,   // 12 heures - modifiées par admin seulement
  categories: 24 * 60 * 60 * 1000,  // 24 heures
  'exercises-full': 6 * 60 * 60 * 1000, // 6 heures - données imbriquées
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
const categoriesRef = (typeId) => db.collection('types').doc(typeId).collection('categories');

// ============================================
// FONCTIONS OPTIMISÉES AVEC COLLECTION GROUP + CACHE
// ============================================

// NOUVELLE: Récupère TOUS les exercices avec collection group + cache
const getAllExercises = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('exercises', { all: true });
  const cached = cache.get(cacheKey);

  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getAllExercises');
    return cached.data;
  }

  try {
    console.log('📥 Fetching all exercises with collectionGroup...');

    // OPTIMISATION: Une seule requête au lieu de N boucles
    const snapshot = await db.collectionGroup('exercises').get();
    const allExercises = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));

    cache.set(cacheKey, {
      data: allExercises,
      timestamp: Date.now()
    });

    console.log(`📊 Lectures: ${snapshot.size} exercices (Cache: 12h)`);
    return allExercises;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
};

// OPTIMISÉE: Récupère les exercices d'une catégorie avec cache
const getAllExercisesIn = async (typeId, categoryId, forceRefresh = false) => {
  const cacheKey = getCacheKey('exercises', { typeId, categoryId });
  const cached = cache.get(cacheKey);

  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getAllExercisesIn', categoryId);
    return cached.data;
  }

  console.log('📥 Fetching exercises for category:', categoryId);
  const snapshot = await categoriesRef(typeId).doc(categoryId).collection('exercises').get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  console.log(`📊 Lectures: ${snapshot.size} exercices (Cache: 12h)`);
  return data;
};

// NOUVELLE: Version optimisée avec collection group et filtres
const getExercisesOptimized = async (options = {}) => {
  const {
    typeId = null,
    categoryId = null,
    status = null,
    difficulty = null,
    limit = null,
    orderBy = 'createdAt',
    orderDirection = 'desc',
    forceRefresh = false
  } = options;

  const cacheKey = getCacheKey('exercises', options);
  const cached = cache.get(cacheKey);

  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getExercisesOptimized');
    return cached.data;
  }

  console.log('📥 Fetching exercises with collectionGroup and filters...');
  let query = db.collectionGroup('exercises');

  // IMPORTANT: Ajouter typeId et categoryId dans vos documents exercises
  if (typeId) query = query.where('typeId', '==', typeId);
  if (categoryId) query = query.where('categoryId', '==', categoryId);
  if (status) query = query.where('status', '==', status);
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

  console.log(`📊 Lectures: ${snapshot.size} exercices (Cache: 12h)`);
  return data;
};

// OPTIMISÉE: Récupère un exercice par ID avec cache
const getExerciseById = async (typeId, categoryId, exerciseId, forceRefresh = false) => {
  const cacheKey = getCacheKey('exercises', { typeId, categoryId, exerciseId });
  const cached = cache.get(cacheKey);

  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getExerciseById');
    return cached.data;
  }

  const doc = await categoriesRef(typeId)
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
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

// Alias pour compatibilité
const getExerciseByIdinType = async (typeId, categoryId, exerciseId) => {
  return getExerciseById(typeId, categoryId, exerciseId);
};

// OPTIMISÉE: Version simplifiée (sans typeId)
const getExerciseByid = async (categoryId, exerciseId, forceRefresh = false) => {
  const cacheKey = getCacheKey('exercises', { categoryId, exerciseId });
  const cached = cache.get(cacheKey);

  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getExerciseByid');
    return cached.data;
  }

  const exerciseRef = db.collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId);

  const doc = await exerciseRef.get();
  const data = doc.exists ? doc.data() : null;

  if (data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  return data;
};

// OPTIMISÉE: getAllMobilityExercice avec collection group
const getAllMobilityExercice = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('exercises', { mobility: true });
  const cached = cache.get(cacheKey);

  if (!forceRefresh && isCacheValid(cached, 'exercises')) {
    console.log('✅ Cache hit: getAllMobilityExercice');
    return cached.data;
  }

  try {
    console.log('📥 Fetching mobility exercises with collectionGroup...');

    // AVANT: Boucle sur categories puis exercices (N×M lectures)
    // APRÈS: Une seule requête collection group
    const snapshot = await db.collectionGroup('exercices').get();
    const allExercises = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));

    cache.set(cacheKey, {
      data: allExercises,
      timestamp: Date.now()
    });

    console.log(`📊 Lectures: ${snapshot.size} exercices (Cache: 12h)`);
    return allExercises;
  } catch (error) {
    console.error("Error fetching mobility exercises:", error);
    return [];
  }
};

// ============================================
// FONCTIONS DE MODIFICATION (avec invalidation cache)
// ============================================

// Add a new exercise
const addExerciseToCategory = async (typeId, categoryId, exerciseData) => {
  const typeRef = db.collection('types').doc(typeId);
  const categoryRef = typeRef.collection('categories').doc(categoryId);
  const exercisesRef = categoryRef.collection('exercises');

  // IMPORTANT: Ajouter typeId et categoryId pour collection group
  const dataToAdd = {
    ...exerciseData,
    typeId,      // Nécessaire pour filtrer avec collection group
    categoryId,  // Nécessaire pour filtrer avec collection group
    createdAt: new Date()
  };

  const exerciseDoc = await exercisesRef.add(dataToAdd);

  // Invalide le cache après ajout
  invalidateCache('exercises');

  console.log('✅ Exercise added, cache invalidated');
  return exerciseDoc.id;
};

// Update an exercise
const updateExerciseInCategory = async (typeId, categoryId, exerciseId, updatedData) => {
  const exerciseRef = db.collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId);

  await exerciseRef.update({
    ...updatedData,
    typeId,      // S'assure que typeId est présent
    categoryId,  // S'assure que categoryId est présent
    updatedAt: new Date()
  });

  // Invalide le cache après mise à jour
  invalidateCache('exercises');

  console.log('✅ Exercise updated, cache invalidated');
};

// Delete an exercise
const deleteExerciseFromDatabase = async (typeId, categoryId, exerciseId) => {
  await db.collection('types')
    .doc(typeId)
    .collection('categories')
    .doc(categoryId)
    .collection('exercises')
    .doc(exerciseId)
    .delete();

  // Invalide le cache après suppression
  invalidateCache('exercises');

  console.log('✅ Exercise deleted, cache invalidated');
};

// ============================================
// FONCTIONS DE RECHERCHE OPTIMISÉES
// ============================================

// NOUVELLE: Recherche d'exercices par nom avec collection group
const searchExercisesByName = async (searchQuery, options = {}) => {
  const {
    typeId = null,
    categoryId = null,
    limit = 50,
    forceRefresh = false
  } = options;

  const cacheKey = getCacheKey('exercises-search', { searchQuery, ...options });
  const cached = cache.get(cacheKey);

  // Cache plus court pour les recherches (30 min)
  const searchCacheDuration = 30 * 60 * 1000;
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < searchCacheDuration)) {
    console.log('✅ Cache hit: searchExercisesByName');
    return cached.data;
  }

  console.log('📥 Searching exercises...');
  let query = db.collectionGroup('exercises');

  // Filtres optionnels
  if (typeId) query = query.where('typeId', '==', typeId);
  if (categoryId) query = query.where('categoryId', '==', categoryId);

  // Recherche par nom (startsWith)
  if (searchQuery) {
    const searchEnd = searchQuery.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
    query = query
      .where('name', '>=', searchQuery)
      .where('name', '<', searchEnd);
  }

  query = query.limit(limit);

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

  console.log(`📊 Trouvé: ${snapshot.size} exercices`);
  return data;
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
  getAllExercisesIn,
  getExerciseById,
  getExerciseByIdinType,
  addExerciseToCategory,
  updateExerciseInCategory,
  getExerciseByid,
  deleteExerciseFromDatabase,
  getAllMobilityExercice,

  // Nouvelles fonctions optimisées
  getAllExercises,
  getExercisesOptimized,
  searchExercisesByName,
  invalidateCache,
  getCacheStats,
  clearExpiredCache
};