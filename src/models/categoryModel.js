// const { db } = require('../Firebase/firebaseAdmin');

// // Get the reference to the categories collection
// const categoryRef = db.collection('categories');
// const typesRef = db.collection('types');

// const categorieRef = (typeId) => db.collection('types').doc(typeId).collection('categories');
// // Add a new category
// const addCategory = async (typeId,categoryData) => {
//   const typeRef = db.collection('types').doc(typeId);
//   const categoryRef = typeRef.collection('categories');

//   const categoryDoc = await categoryRef.add(categoryData);
//   return { id: categoryDoc.id, ...categoryData };
// };


// const getAllCat = async () => {
//   try {
//     const typesRef = db.collection('types'); // Reference to the 'types' collection
//     const typesSnapshot = await typesRef.get(); // Fetch all documents from 'types'
//     const allCategories = []; // Initialize an array to store categories

//     // Loop through each document in the 'types' collection
//     for (const doc of typesSnapshot.docs) {
//       // Reference to the 'categories' subcollection for each document
//       const categoriesRef = doc.ref.collection('categories');
//       const categoriesSnapshot = await categoriesRef.get(); // Fetch the categories subcollection

//       // Loop through the categories and push them to the array
//       categoriesSnapshot.forEach(catDoc => {
//         allCategories.push({id: catDoc.id, ...catDoc.data()}); // Add category data to the list
//       });
//     }

//     // Return the array of all categories as a JSON
//     return allCategories;
//   } catch (error) {
//     console.error("Error fetching categories:", error); // Log any errors
//     return []; // Return an empty array in case of error
//   }
// };





// // Get all categories
// const getAllCategories = async (typeId) => {
//   const snapshot = await categorieRef(typeId).get();
//   return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// // Get category by ID
// const getCategoryById = async (id) => {
//   const categoryDoc = await categoryRef.doc(id).get();
//   if (!categoryDoc.exists) throw new Error('Category not found');
//   return { id: categoryDoc.id, ...categoryDoc.data() };
// };

// // Get category by ID
// const getCategory = async (typeId,categoryId) => {
//   const doc = await categorieRef(typeId).doc(categoryId).get();
//   return doc.exists ? { id: doc.id, ...doc.data() } : null;
// };


// // Update a category
// const updateCategory = async (id, updatedData) => {
//   const categoryDoc = categoryRef.doc(id);
//   await categoryDoc.update(updatedData);
//   const updatedCategory = await categoryDoc.get();
//   return { id: updatedCategory.id, ...updatedCategory.data() };
// };

// // Delete a category
// const deleteCategory = async (id) => {
//   await categoryRef.doc(id).delete();
// };


// const getCategoryWithExercisesLevelsAndVideos = async (typeId,categoryId) => {
//   const categoryRef = db.collection('types').doc(typeId).collection('categories').doc(categoryId);
//   const categorySnapshot = await categoryRef.get();

//   if (!categorySnapshot.exists) {
//     throw new Error('Category not found');
//   }

//   const categoryData = categorySnapshot.data();

//   // Fetch exercises from the subcollection
//   const exercisesSnapshot = await categoryRef.collection('exercises').get();
//   const exercises = await Promise.all(exercisesSnapshot.docs.map(async (exerciseDoc) => {
//     const exerciseData = exerciseDoc.data();
//     const levelsSnapshot = await exerciseDoc.ref.collection('levels').get();
//     const levels = await Promise.all(levelsSnapshot.docs.map(async (levelDoc) => {
//       const levelData = levelDoc.data();
//       const videosSnapshot = await levelDoc.ref.collection('videos').get();
//       const videos = videosSnapshot.docs.map(videoDoc => ({
//         id: videoDoc.id,
//         ...videoDoc.data(),
//       }));
//       return {
//         id: levelDoc.id,
//         ...levelData,
//         videos,
//       };
//     }));
//     return {
//       id: exerciseDoc.id,
//       ...exerciseData,
//       levels,
//     };
//   }));

//   return {
//     id: categorySnapshot.id,
//     ...categoryData,
//     exercises,
//   };
// };

// // Function to update an exercise in a specific category
// const updateCategoryInType = async (typeId, categoryId, updatedData) => {
//   const categorieRef = db.collection('types')
//                         .doc(typeId)
//                         .collection('categories')
//                         .doc(categoryId);
//   await categorieRef.update(updatedData);
// };

// const getVideoCountByCategoryId = async (categoryId) => {
//   try {
//     const typesSnapshot = await db.collection('types').get();

//     for (const typeDoc of typesSnapshot.docs) {
//       const categoriesRef = typeDoc.ref.collection('categories');
//       const categoryDoc = await categoriesRef.doc(categoryId).get();

//       if (categoryDoc.exists) {
//         let totalVideoCount = 0;

//         const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();
//         for (const exerciseDoc of exercisesSnapshot.docs) {
//           const atackSnapshot = await exerciseDoc.ref.collection('atack').get();

//           for (const atackDoc of atackSnapshot.docs) {
//             const levelsSnapshot = await atackDoc.ref.collection('levels').get();

//             for (const levelDoc of levelsSnapshot.docs) {
//               const videosSnapshot = await levelDoc.ref.collection('videos').get();
//               totalVideoCount += videosSnapshot.size;
//             }
//           }
//         }

//         return {
//           categoryId,
//           videoCount: totalVideoCount
//         };
//       }
//     }

//     throw new Error(`Category with ID ${categoryId} not found`);
//   } catch (error) {
//     console.error('Error counting videos:', error);
//     throw error;
//   }
// };





// module.exports = {
//   addCategory,getCategory,
//   getAllCategories,
//   getCategoryById,
//   updateCategory,
//   deleteCategory,updateCategoryInType,
//   getCategoryWithExercisesLevelsAndVideos,
//   getAllCat,
//   getVideoCountByCategoryId
// };








const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// SYSTÈME DE CACHE
// ============================================
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (collectionName, filters = {}) => {
  return `${collectionName}_${JSON.stringify(filters)}`;
};

const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
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
  
  if (!forceRefresh && isCacheValid(cached)) {
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
    
    console.log(`📊 Lectures: ${snapshot.size} documents`);
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
  
  if (!forceRefresh && isCacheValid(cached)) {
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
  
  console.log(`📊 Lectures: ${snapshot.size} documents`);
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
  
  if (!forceRefresh && isCacheValid(cached)) {
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
  
  console.log(`📊 Lectures: ${snapshot.size} documents`);
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
    updatedAt: new Date()
  });
  
  // Invalide le cache
  invalidateCache('categories');
};

// Delete a category
const deleteCategory = async (id) => {
  await categoryRef.doc(id).delete();
  
  // Invalide le cache après suppression
  invalidateCache('categories');
};

// ============================================
// FONCTIONS COMPLEXES (inchangées)
// ============================================

const getCategoryWithExercisesLevelsAndVideos = async (typeId, categoryId) => {
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

  return {
    id: categorySnapshot.id,
    ...categoryData,
    exercises,
  };
};

const getVideoCountByCategoryId = async (categoryId) => {
  try {
    const typesSnapshot = await db.collection('types').get();

    for (const typeDoc of typesSnapshot.docs) {
      const categoriesRef = typeDoc.ref.collection('categories');
      const categoryDoc = await categoriesRef.doc(categoryId).get();

      if (categoryDoc.exists) {
        let totalVideoCount = 0;

        const exercisesSnapshot = await categoryDoc.ref.collection('exercises').get();
        for (const exerciseDoc of exercisesSnapshot.docs) {
          const atackSnapshot = await exerciseDoc.ref.collection('atack').get();

          for (const atackDoc of atackSnapshot.docs) {
            const levelsSnapshot = await atackDoc.ref.collection('levels').get();

            for (const levelDoc of levelsSnapshot.docs) {
              const videosSnapshot = await levelDoc.ref.collection('videos').get();
              totalVideoCount += videosSnapshot.size;
            }
          }
        }

        return {
          categoryId,
          videoCount: totalVideoCount
        };
      }
    }

    throw new Error(`Category with ID ${categoryId} not found`);
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
    totalItems: 0
  };
  
  for (const [key, value] of cache.entries()) {
    const age = Date.now() - value.timestamp;
    const isValid = age < CACHE_DURATION;
    
    stats.keys.push({
      key,
      itemCount: value.data.length,
      ageMs: age,
      isValid
    });
    
    stats.totalItems += value.data.length;
  }
  
  return stats;
};

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
  getCacheStats
};