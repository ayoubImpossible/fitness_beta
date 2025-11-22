// const { db, admin  } = require('../Firebase/firebaseAdmin');

// const PlansRef = db.collection('plans');

// const addPlanToDB = async (userId, planData) => {
//   const plansCollection = db.collection('plans'); // Replace with your DB schema
//   const planDoc = await plansCollection.add({
//     ...planData,
//     userId,
//   });

//   return { id: planDoc.id, ...planData };
// };


// const deletePlanById = async (planId) => {
//   try {
//     // Reference the specific plan document
//     const planDocRef = PlansRef.doc(planId);

//     // Check if the plan exists
//     const docSnapshot = await planDocRef.get();
//     if (!docSnapshot.exists) {
//       throw new Error("Plan not found");
//     }

//     // Delete the plan
//     await planDocRef.delete();

//     return { success: true, message: "Plan deleted successfully." };
//   } catch (error) {
//     console.error("Error deleting plan:", error);
//     throw error;
//   }
// };


// const getAllPlans = async (userId) => {
//   try {
//     // Query Firestore for plans where userId matches
//     const snapshot = await PlansRef.where("userId", "==", userId).get();
    
//     // Map the documents to an array
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error("Error fetching plans:", error);
//     throw error; // Propagate error to handle it elsewhere
//   }
// };


// module.exports = {
//   addPlanToDB,
//   getAllPlans
//   ,deletePlanById
// };








const { db, admin } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE - COURTE DURÉE
// ============================================
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes pour données utilisateur

// ============================================
// SYSTÈME DE CACHE
// ============================================
const cache = new Map();

const getCacheKey = (userId) => {
  return `plans_${userId}`;
};

const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

// Invalide le cache d'un utilisateur spécifique
const invalidateUserCache = (userId) => {
  const cacheKey = getCacheKey(userId);
  cache.delete(cacheKey);
  console.log(`🗑️ Cache invalidé pour user: ${userId}`);
};

// ============================================
// RÉFÉRENCES
// ============================================
const PlansRef = db.collection('plans');

// ============================================
// FONCTIONS ORIGINALES AVEC CACHE
// ============================================

// OPTIMISÉE: Ajouter un plan (LOGIQUE IDENTIQUE)
const addPlanToDB = async (userId, planData) => {
  const plansCollection = db.collection('plans');
  const planDoc = await plansCollection.add({
    ...planData,
    userId,
  });

  // Invalide le cache de cet utilisateur
  invalidateUserCache(userId);

  return { id: planDoc.id, ...planData };
};

// OPTIMISÉE: Supprimer un plan (LOGIQUE IDENTIQUE)
const deletePlanById = async (planId) => {
  try {
    const planDocRef = PlansRef.doc(planId);

    const docSnapshot = await planDocRef.get();
    if (!docSnapshot.exists) {
      throw new Error("Plan not found");
    }

    // Récupère le userId AVANT de supprimer
    const userId = docSnapshot.data().userId;

    await planDocRef.delete();

    // Invalide le cache de cet utilisateur
    invalidateUserCache(userId);

    return { success: true, message: "Plan deleted successfully." };
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
};

// OPTIMISÉE: Récupérer les plans (LOGIQUE IDENTIQUE + CACHE)
const getAllPlans = async (userId) => {
  // Vérifier le cache
  const cacheKey = getCacheKey(userId);
  const cached = cache.get(cacheKey);
  
  if (isCacheValid(cached)) {
    console.log('✅ Cache hit: getAllPlans for user', userId);
    return cached.data;
  }

  try {
    console.log('📥 Fetching plans from Firestore for user:', userId);
    
    // LOGIQUE ORIGINALE EXACTE
    const snapshot = await PlansRef.where("userId", "==", userId).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Mettre en cache pour 2 minutes
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} plans (Cache: 2 min)`);
    return data;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

// ============================================
// NETTOYAGE AUTOMATIQUE DU CACHE
// ============================================
const clearExpiredCache = () => {
  let clearedCount = 0;
  
  for (const [key, value] of cache.entries()) {
    if (!isCacheValid(value)) {
      cache.delete(key);
      clearedCount++;
    }
  }
  
  if (clearedCount > 0) {
    console.log(`🗑️ ${clearedCount} caches expirés supprimés`);
  }
  return clearedCount;
};

// Nettoyage automatique toutes les 2 minutes
setInterval(() => {
  clearExpiredCache();
}, 2 * 60 * 1000);

// ============================================
// EXPORTS
// ============================================
module.exports = {
  addPlanToDB,
  getAllPlans,
  deletePlanById
};