const { db } = require('../Firebase/firebaseAdmin');

// ============================================
// CONFIGURATION DU CACHE
// ============================================
const CACHE_CONFIG = {
  'programs': 12 * 60 * 60 * 1000,        // 12 heures
  'phases': 12 * 60 * 60 * 1000,          // 12 heures
  'days': 6 * 60 * 60 * 1000,             // 6 heures
  'day-videos': 6 * 60 * 60 * 1000,       // 6 heures
  'exercices': 12 * 60 * 60 * 1000,  // Add this line

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
const ProgramsRef = db.collection('construire');
const exercicesRef = db.collection('PreparerExercices');
// ============================================
// STRUCTURE:
// construire (collection)
//   └─ {programId} (doc)
//       ├─ name: "Programme Yoga Détente" OU "Programme Abdos 30j"
//       ├─ description: "Description du programme"
//       ├─ exerciseCount: 15 (nombre total d'exercices)
//       ├─ createdAt: timestamp
//       └─ phases (subcollection)
//           └─ {phaseId} (doc)
//               ├─ phaseNumber: 1
//               ├─ type: "yoga" | "relax" | "musculation"
//               ├─ muscleAttacker: "abs" | "dorsal" | null (seulement si type="musculation")
//               ├─ description: "Phase d'initiation"
//               └─ days (subcollection)
//                   └─ {dayId} (doc)
//                       ├─ dayNumber: 1
//                       ├─ title: "Jour 1 - Échauffement"
//                       └─ videos (subcollection)
//                           └─ {videoId} (doc)
//                               ├─ videoUrl: "https://..."
//                               ├─ titre: "Exercice 1"
//                               ├─ description: "..."
//                               ├─ imageUrl: "https://..."
//                               ├─ order: 1
//                               └─ duration: 300
// ============================================

// ============================================
// FONCTIONS PROGRAMME
// ============================================

/**
 * Créer un nouveau programme
 */
const createProgram = async (programData) => {
  const { name, description, exerciseCount } = programData;
  
  const programDoc = await ProgramsRef.add({
    name,
    description: description || '',
    exerciseCount: exerciseCount || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  invalidateCache('programs');
  
  console.log('✅ Program created:', programDoc.id);
  return { id: programDoc.id, ...programData };
};

/**
 * Récupérer tous les programmes
 */
const getAllPrograms = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('programs', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'programs')) {
    console.log('✅ Cache hit: getAllPrograms');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all programs...');
    const snapshot = await ProgramsRef.get();
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} programmes (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

/**
 * Récupérer un programme par ID
 */
const getProgramById = async (programId, forceRefresh = false) => {
  const cacheKey = getCacheKey('programs', { programId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'programs')) {
    console.log('✅ Cache hit: getProgramById');
    return cached.data;
  }
  
  const doc = await ProgramsRef.doc(programId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = { id: doc.id, ...doc.data() };
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};


const getExerciceById = async (exerciceId, forceRefresh = false) => {
  const cacheKey = getCacheKey('exercices', { exerciceId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'exercices')) {
    console.log('✅ Cache hit: getExerciceById');
    return cached.data;
  }
  
  const doc = await exercicesRef.doc(exerciceId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = { id: doc.id, ...doc.data() };
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

/**
 * Mettre à jour un programme
 */
const updateProgram = async (programId, updateData) => {
  await ProgramsRef.doc(programId).update({
    ...updateData,
    updatedAt: new Date()
  });
  
  invalidateCache('programs');
  console.log('✅ Program updated:', programId);
};

/**
 * Supprimer un programme (et toutes ses phases, jours, vidéos)
 */
const deleteProgram = async (programId) => {
  const batch = db.batch();
  
  // Supprimer toutes les phases et leurs sous-collections
  const phasesSnapshot = await ProgramsRef.doc(programId).collection('phases').get();
  
  for (const phaseDoc of phasesSnapshot.docs) {
    const daysSnapshot = await phaseDoc.ref.collection('days').get();
    
    for (const dayDoc of daysSnapshot.docs) {
      const videosSnapshot = await dayDoc.ref.collection('videos').get();
      
      videosSnapshot.docs.forEach(videoDoc => {
        batch.delete(videoDoc.ref);
      });
      
      batch.delete(dayDoc.ref);
    }
    
    batch.delete(phaseDoc.ref);
  }
  
  // Supprimer le programme
  batch.delete(ProgramsRef.doc(programId));
  
  await batch.commit();
  
  invalidateCache('programs');
  invalidateCache('phases');
  invalidateCache('days');
  invalidateCache('day-videos');
  
  console.log('✅ Program deleted:', programId);
};

// ============================================
// FONCTIONS PHASE
// ============================================

/**
 * Ajouter une phase à un programme
 */
const addPhaseToProgram = async (programId, phaseData) => {
  const { phaseNumber, type, muscleAttacker, description } = phaseData;
  
  // Valider que muscleAttacker n'est fourni que si type = "musculation"
  const dataToAdd = {
    phaseNumber,
    type,                   // "yoga", "relax", "musculation"
    description: description || '',
    programId,              // Pour collection group
    createdAt: new Date()
  };
  
  // Ajouter muscleAttacker seulement si type = "musculation"
  if (type === 'musculation' && muscleAttacker) {
    dataToAdd.muscleAttacker = muscleAttacker;
  }
  
  const phaseDoc = await ProgramsRef.doc(programId).collection('phases').add(dataToAdd);
  
  invalidateCache('phases');
  
  console.log('✅ Phase added:', phaseDoc.id);
  return { id: phaseDoc.id, ...dataToAdd };
};

/**
 * Récupérer toutes les phases d'un programme
 */
const getPhasesByProgram = async (programId, forceRefresh = false) => {
  const cacheKey = getCacheKey('phases', { programId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'phases')) {
    console.log('✅ Cache hit: getPhasesByProgram');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching phases for program:', programId);
    const snapshot = await ProgramsRef.doc(programId)
      .collection('phases')
      .orderBy('phaseNumber', 'asc')
      .get();
    
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} phases (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching phases:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les phases (avec collection group)
 */
const getAllPhases = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('phases', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'phases')) {
    console.log('✅ Cache hit: getAllPhases');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all phases with collectionGroup...');
    const snapshot = await db.collectionGroup('phases').get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} phases (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching all phases:', error);
    throw error;
  }
};

/**
 * Récupérer les phases par type (yoga, relax, musculation)
 */
const getPhasesByType = async (type, forceRefresh = false) => {
  const cacheKey = getCacheKey('phases', { type });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'phases')) {
    console.log('✅ Cache hit: getPhasesByType');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching phases by type:', type);
    const snapshot = await db.collectionGroup('phases')
      .where('type', '==', type)
      .get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      programId: doc.data().programId,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} phases (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching phases by type:', error);
    throw error;
  }
};

/**
 * Récupérer les phases par muscle (seulement pour type="musculation")
 */
const getPhasesByMuscle = async (muscleAttacker, forceRefresh = false) => {
  const cacheKey = getCacheKey('phases', { muscleAttacker });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'phases')) {
    console.log('✅ Cache hit: getPhasesByMuscle');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching phases by muscle:', muscleAttacker);
    const snapshot = await db.collectionGroup('phases')
      .where('type', '==', 'musculation')
      .where('muscleAttacker', '==', muscleAttacker)
      .get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      programId: doc.data().programId,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} phases (Cache: 12h)`);
    return data;
  } catch (error) {
    console.error('Error fetching phases by muscle:', error);
    throw error;
  }
};

/**
 * Récupérer les programmes qui ont des phases de type spécifique
 */
const getProgramsByPhaseType = async (type, forceRefresh = false) => {
  try {
    const phases = await getPhasesByType(type, forceRefresh);
    
    // Extraire les programIds uniques
    const programIds = [...new Set(phases.map(phase => phase.programId))];
    
    // Récupérer les programmes
    const programs = [];
    for (const programId of programIds) {
      const program = await getProgramById(programId, forceRefresh);
      if (program) {
        programs.push(program);
      }
    }
    
    return programs;
  } catch (error) {
    console.error('Error fetching programs by phase type:', error);
    throw error;
  }
};

/**
 * Récupérer les programmes qui ont des phases ciblant un muscle spécifique
 */
const getProgramsByMuscle = async (muscleAttacker, forceRefresh = false) => {
  try {
    const phases = await getPhasesByMuscle(muscleAttacker, forceRefresh);
    
    // Extraire les programIds uniques
    const programIds = [...new Set(phases.map(phase => phase.programId))];
    
    // Récupérer les programmes
    const programs = [];
    for (const programId of programIds) {
      const program = await getProgramById(programId, forceRefresh);
      if (program) {
        programs.push(program);
      }
    }
    
    return programs;
  } catch (error) {
    console.error('Error fetching programs by muscle:', error);
    throw error;
  }
};

/**
 * Mettre à jour une phase
 */
const updatePhase = async (programId, phaseId, updateData) => {
  await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .update({
      ...updateData,
      updatedAt: new Date()
    });
  
  invalidateCache('phases');
  console.log('✅ Phase updated:', phaseId);
};

/**
 * Supprimer une phase
 */
const deletePhase = async (programId, phaseId) => {
  const batch = db.batch();
  
  // Supprimer tous les jours et vidéos
  const daysSnapshot = await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .get();
  
  for (const dayDoc of daysSnapshot.docs) {
    const videosSnapshot = await dayDoc.ref.collection('videos').get();
    
    videosSnapshot.docs.forEach(videoDoc => {
      batch.delete(videoDoc.ref);
    });
    
    batch.delete(dayDoc.ref);
  }
  
  // Supprimer la phase
  batch.delete(ProgramsRef.doc(programId).collection('phases').doc(phaseId));
  
  await batch.commit();
  
  invalidateCache('phases');
  invalidateCache('days');
  invalidateCache('day-videos');
  
  console.log('✅ Phase deleted:', phaseId);
};

// ============================================
// FONCTIONS DAY (JOUR)
// ============================================

/**
 * Ajouter un jour à une phase
 */
const addDayToPhase = async (programId, phaseId, dayData) => {
  const { dayNumber, title } = dayData;
  
  const dayDoc = await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .add({
      dayNumber,
      title: title || `Jour ${dayNumber}`,
      programId,    // Pour collection group
      phaseId,      // Pour collection group
      createdAt: new Date()
    });
  
  invalidateCache('days');
  
  console.log('✅ Day added:', dayDoc.id);
  return { id: dayDoc.id, ...dayData };
};

/**
 * Récupérer tous les jours d'une phase
 */
const getDaysByPhase = async (programId, phaseId, forceRefresh = false) => {
  const cacheKey = getCacheKey('days', { programId, phaseId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'days')) {
    console.log('✅ Cache hit: getDaysByPhase');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching days for phase:', phaseId);
    const snapshot = await ProgramsRef.doc(programId)
      .collection('phases')
      .doc(phaseId)
      .collection('days')
      .orderBy('dayNumber', 'asc')
      .get();
    
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} days (Cache: 6h)`);
    return data;
  } catch (error) {
    console.error('Error fetching days:', error);
    throw error;
  }
};

/**
 * Mettre à jour un jour
 */
const updateDay = async (programId, phaseId, dayId, updateData) => {
  await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .doc(dayId)
    .update({
      ...updateData,
      updatedAt: new Date()
    });
  
  invalidateCache('days');
  console.log('✅ Day updated:', dayId);
};

/**
 * Supprimer un jour
 */
const deleteDay = async (programId, phaseId, dayId) => {
  const batch = db.batch();
  
  // Supprimer toutes les vidéos
  const videosSnapshot = await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .doc(dayId)
    .collection('videos')
    .get();
  
  videosSnapshot.docs.forEach(videoDoc => {
    batch.delete(videoDoc.ref);
  });
  
  // Supprimer le jour
  batch.delete(
    ProgramsRef.doc(programId)
      .collection('phases')
      .doc(phaseId)
      .collection('days')
      .doc(dayId)
  );
  
  await batch.commit();
  
  invalidateCache('days');
  invalidateCache('day-videos');
  
  console.log('✅ Day deleted:', dayId);
};

// ============================================
// FONCTIONS VIDEO
// ============================================

/**
 * Ajouter une vidéo à un jour
 */
const addVideoToDay = async (programId, phaseId, dayId, videoData) => {
  const { videoUrl, titre, description, imageUrl, order, duration } = videoData;
  const videoDoc = await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .doc(dayId)
    .collection('videos')
    .add({
      videoUrl,
      titre,
      description: description || '',
      imageUrl: imageUrl || '',
      order: order || 0,
      duration: duration || 0,
      programId,    // Pour collection group
      phaseId,      // Pour collection group
      dayId,        // Pour collection group
      createdAt: new Date()
    });
  
  invalidateCache('day-videos');
  
  console.log('✅ Video added:', videoDoc.id);
  return { id: videoDoc.id, ...videoData };
};

/**
 * Récupérer toutes les vidéos d'un jour
 */
const getVideosByDay = async (programId, phaseId, dayId, forceRefresh = false) => {
  const cacheKey = getCacheKey('day-videos', { programId, phaseId, dayId });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'day-videos')) {
    console.log('✅ Cache hit: getVideosByDay');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching videos for day:', dayId);
    const snapshot = await ProgramsRef.doc(programId)
      .collection('phases')
      .doc(phaseId)
      .collection('days')
      .doc(dayId)
      .collection('videos')
      .orderBy('order', 'asc')
      .get();
    
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} videos (Cache: 6h)`);
    return data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les vidéos (avec collection group)
 */
const getAllDayVideos = async (forceRefresh = false) => {
  const cacheKey = getCacheKey('day-videos', { all: true });
  const cached = cache.get(cacheKey);
  
  if (!forceRefresh && isCacheValid(cached, 'day-videos')) {
    console.log('✅ Cache hit: getAllDayVideos');
    return cached.data;
  }
  
  try {
    console.log('📥 Fetching all day videos with collectionGroup...');
    const snapshot = await db.collectionGroup('videos')
      .where('dayId', '!=', null)
      .get();
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data()
    }));
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`📊 ${snapshot.size} day videos (Cache: 6h)`);
    return data;
  } catch (error) {
    console.error('Error fetching all day videos:', error);
    throw error;
  }
};

/**
 * Mettre à jour une vidéo
 */
const updateVideo = async (programId, phaseId, dayId, videoId, updateData) => {
  await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .doc(dayId)
    .collection('videos')
    .doc(videoId)
    .update({
      ...updateData,
      updatedAt: new Date()
    });
  
  invalidateCache('day-videos');
  console.log('✅ Video updated:', videoId);
};

/**
 * Supprimer une vidéo
 */
const deleteVideo = async (programId, phaseId, dayId, videoId) => {
  await ProgramsRef.doc(programId)
    .collection('phases')
    .doc(phaseId)
    .collection('days')
    .doc(dayId)
    .collection('videos')
    .doc(videoId)
    .delete();
  
  invalidateCache('day-videos');
  
  console.log('✅ Video deleted:', videoId);
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Récupérer la structure complète d'un programme
 */
const getFullProgramStructure = async (programId) => {
  const program = await getProgramById(programId);
  
  if (!program) {
    return null;
  }
  
  const phases = await getPhasesByProgram(programId);
  
  for (const phase of phases) {
    phase.days = await getDaysByPhase(programId, phase.id);
    
    for (const day of phase.days) {
      day.videos = await getVideosByDay(programId, phase.id, day.id);
    }
  }
  
  return {
    ...program,
    phases
  };
};

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




const updatePlanLike = async (planId, updatedData) => {
  const planref = db.collection('construire')
    .doc(planId)
  
  await planref.update({
    ...updatedData,
    planId, // S'assure que planId est toujours présent
    updatedAt: new Date()
  });
  
  console.log('✅ Plan updated successfully');
};


const updateExerciceLike = async (exerciceId, updatedData) => {
  const exerciceRef = exercicesRef.doc(exerciceId);
  
  await exerciceRef.update({
    ...updatedData,
    exerciceId, // S'assure que exerciceId est toujours présent
    updatedAt: new Date()
  });
  
  console.log('✅ Exercice updated successfully');
};
// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Programme
  updatePlanLike,
  updateExerciceLike,
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  getProgramsByPhaseType,
  getProgramsByMuscle,
  
  // Phase
  addPhaseToProgram,
  getPhasesByProgram,
  getAllPhases,
  getPhasesByType,
  getPhasesByMuscle,
  updatePhase,
  deletePhase,
  
  // Day
  addDayToPhase,
  getDaysByPhase,
  updateDay,
  deleteDay,
  
  // Video
  addVideoToDay,
  getVideosByDay,
  getAllDayVideos,
  updateVideo,
  deleteVideo,
  
  // Utilitaires
  getFullProgramStructure,
  invalidateCache,
  getCacheStats,
  clearExpiredCache,
  getExerciceById
};