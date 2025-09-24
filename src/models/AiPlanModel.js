// const { db } = require('../Firebase/firebaseAdmin');


// const cleanObjectForFirestore = (obj) => {
//   if (obj === null || obj === undefined) return null;

//   if (Array.isArray(obj)) return obj.map(item => cleanObjectForFirestore(item));

//   if (typeof obj === 'object') {
//     const cleaned = {};
//     for (const [key, value] of Object.entries(obj)) {
//       if (value !== undefined) cleaned[key] = cleanObjectForFirestore(value);
//     }
//     return cleaned;
//   }

//   return obj;
// };


// const mapUserLevelToDifficulty = (userLevel) => {
//   if (!userLevel) return 'beginner';
//   switch (userLevel.toLowerCase()) {
//     case 'beginner': return 'beginner';
//     case 'intermediate': return 'Intermediate';
//     case 'hard': return 'Hard';
//     default: return 'beginner';
//   }
// };



// const generatePersonalizedPlan = async (userParams) => {
//   const { age, weight, level, equippment, userId } = userParams;

//   try {
//     // Find existing NON-SAVED plans for this user
//     const existingPlansSnapshot = await db.collection('ai_generated_plans')
//       .where('userId', '==', userId)
//       .where('type', '==', 'ai_generated')
//       .where('isSaved', '==', false)
//       .get();

//     // Delete only NON-SAVED existing plans for this user (keep saved ones)
//     const deletePromises = existingPlansSnapshot.docs.map(doc => 
//       db.collection('ai_generated_plans').doc(doc.id).delete()
//     );
//     await Promise.all(deletePromises);

//     const videosSnapshot = await db.collectionGroup('videos').get();
//     if (videosSnapshot.empty) throw new Error('No videos available in database');

//     const filteredVideos = [];
//     videosSnapshot.forEach(doc => {
//       const videoData = doc.data();
//       const userDifficultyLevel = mapUserLevelToDifficulty(level);

//       const matchesDifficulty =
//         videoData.difficulty === userDifficultyLevel ||
//         (!videoData.difficulty && level.toLowerCase() === 'beginner');

//       const matchesEquipment =
//         !equippment ||
//         videoData.equipment === equippment ||
//         (Array.isArray(videoData.equipment) && videoData.equipment.includes(equippment));

//       if (matchesDifficulty && matchesEquipment) {
//         filteredVideos.push({
//           id: doc.id,
//           ...videoData,
//           path: doc.ref.path
//         });
//       }
//     });

//     if (filteredVideos.length === 0) throw new Error('No suitable videos found for user parameters');

//     const monthlyPlan = generateMonthlyPlan(filteredVideos, userParams);
//     const cleanedPlan = cleanObjectForFirestore(monthlyPlan);

//     const planData = {
//       userId,
//       userParams: { age, weight, level, equippment },
//       plan: cleanedPlan,
//       createdAt: new Date().toISOString(),
//       type: 'ai_generated',
//       totalWeeks: 4,
//       isActive: true,
//       isSaved: false // Default to not saved, user can save it later
//     };

//     const cleanedPlanData = cleanObjectForFirestore(planData);
//     const planRef = await db.collection('ai_generated_plans').add(cleanedPlanData);

//     return { id: planRef.id, ...cleanedPlanData };

//   } catch (error) {
//     console.error('Error generating personalized plan:', error);
//     throw error;
//   }
// };



// const generateMonthlyPlan = (videos, userParams) => {
//   const { age, weight, level, equipment } = userParams;
//   const workoutIntensity = calculateWorkoutIntensity(age, weight, level, equipment);
//   const videosByCategory = groupVideosByAttackMuscle(videos);

//   const weeks = [];
//   for (let weekNum = 1; weekNum <= 4; weekNum++) {
//     const week = { weekNumber: weekNum, workouts: [] };

//     for (let dayNum = 1; dayNum <= 7; dayNum++) {
//       if (shouldHaveWorkout(dayNum, weekNum, level)) {
//         const workout = generateDailyWorkout(
//           videosByCategory,
//           weekNum,
//           dayNum + (weekNum - 1) * 7,
//           workoutIntensity
//         );
//         if (workout.exercises.length > 0) week.workouts.push(workout);
//       } else {
//         week.workouts.push({ day: dayNum, type: 'rest', name: 'Rest Day', exercises: [] });
//       }
//     }
//     weeks.push(week);
//   }

//   return {
//     totalWeeks: 4,
//     weeks,
//     summary: {
//       totalWorkouts: weeks.reduce((total, week) =>
//         total + week.workouts.filter(w => w.type !== 'rest').length, 0),
//       avgWorkoutsPerWeek: Math.round(weeks.reduce((total, week) =>
//         total + week.workouts.filter(w => w.type !== 'rest').length, 0) / 4)
//     }
//   };
// };


// const calculateWorkoutIntensity = (age, weight, level) => {
//   let baseIntensity = 1;
//   if (age < 25) baseIntensity += 0.3;
//   else if (age < 35) baseIntensity += 0.2;
//   else if (age < 45) baseIntensity += 0.1;
//   else if (age > 55) baseIntensity -= 0.2;

//   switch (level.toLowerCase()) {
//     case 'beginner': baseIntensity *= 0.7; break;
//     case 'intermediate': baseIntensity *= 1.0; break;
//     case 'hard': baseIntensity *= 1.3; break;
//   }

//   return Math.max(0.5, Math.min(2.0, baseIntensity));
// };


// const groupVideosByAttackMuscle = (videos) => {
//   const grouped = {};
//   videos.forEach(video => {
//     const category = video.atackId || 'general';
//     if (!grouped[category]) grouped[category] = [];
//     grouped[category].push(video);
//   });
//   return grouped;
// };


// const shouldHaveWorkout = (dayNum, weekNum, level) => {
//   const workoutDays = {
//     beginner: [1, 3, 5],
//     intermediate: [1, 2, 4, 5],
//     hard: [1, 2, 3, 4, 5, 6]
//   };
//   return workoutDays[level.toLowerCase()]?.includes(dayNum) || false;
// };


// const generateDailyWorkout = (videosByCategory, weekNum, globalDayNum, intensity) => {
//   const categories = Object.keys(videosByCategory);
//   const exercises = [];

//   if (categories.length === 0) return { day: globalDayNum, type: 'rest', name: `Day ${globalDayNum} - Rest`, exercises: [] };

//   const focusCategory = categories[(globalDayNum - 1) % categories.length];
//   const exerciseCount = Math.floor(4 + (intensity * 2));
//   const categoryVideos = videosByCategory[focusCategory] || [];
//   const primaryExercises = selectRandomVideos(categoryVideos, exerciseCount);

//   let secondaryExercises = [];
//   if (primaryExercises.length < exerciseCount) {
//     const otherCategories = categories.filter(cat => cat !== focusCategory);
//     const secondaryPool = otherCategories.flatMap(cat => videosByCategory[cat] || []);
//     secondaryExercises = selectRandomVideos(secondaryPool, exerciseCount - primaryExercises.length);
//   }

//   const allExercises = [...primaryExercises, ...secondaryExercises];
//   allExercises.forEach((video, index) => {
//     exercises.push({
//       order: index + 1,
//       videoId: video.id || `video_${index + 1}`,
//       name: video.name || `Exercise ${index + 1}`,
//       duration: video.duration || '30s',
//       sets: calculateSets(intensity, weekNum),
//       reps: calculateReps(intensity, video.duration),
//       restTime: calculateRestTime(intensity),
//       videoData: {
//         url: video.videoUrl || null,
//         thumbnail: video.imageUrl || video.thumbnail || null,
//         difficulty: video.difficulty || 'easy',
//         equipment: video.equipment || 'none',
//         muscleAttack: video.muscleAttack || 'general',
//         typeId: video.typeId || null,
//         categoryId: video.categorieId || null,
//         exerciseId: video.exerciceId || null,
//         atackId: video.atackId || focusCategory,
//         levelId: video.levelId || null
//       }
//     });
//   });

//   return {
//     day: globalDayNum,
//     type: 'workout',
//     name: `Day ${globalDayNum} - ${focusCategory} Focus`,
//     focusArea: focusCategory,
//     estimatedDuration: calculateTotalWorkoutTime(exercises),
//     exercises
//   };
// };


// const selectRandomVideos = (videos, count) => {
//   if (!videos || videos.length === 0) return [];
//   const shuffled = [...videos].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, Math.min(count, videos.length));
// };

// const calculateSets = (intensity, weekNum) => {
//   const baseSets = 2 + Math.floor(intensity);
//   const progressiveSets = Math.floor(weekNum / 2);
//   return Math.min(5, Math.max(1, baseSets + progressiveSets));
// };

// const calculateReps = (intensity, duration) => {
//   if (typeof duration === 'string' && duration.includes('s')) return duration;
//   const baseReps = 10 + Math.floor(intensity * 5);
//   return `${baseReps}-${baseReps + 5}`;
// };

// const calculateRestTime = (intensity) => {
//   const baseRest = 60;
//   const adjustedRest = baseRest - (intensity * 10);
//   return `${Math.max(30, adjustedRest)}s`;
// };

// const calculateTotalWorkoutTime = (exercises) => {
//   const totalMinutes = exercises.length * 2;
//   return `${totalMinutes}-${totalMinutes + 10} minutes`;
// };


// const getUserGeneratedPlan = async (userId) => {
//   try {
//     const planSnapshot = await db.collection('ai_generated_plans')
//       .where('userId', '==', userId)
//       .get();

//     if (planSnapshot.empty) return null;

   
//     return planSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   } catch (error) {
//     console.error('Error fetching user plan:', error);
//     throw error;
//   }
// };

// const updatePlanStatus = async (planId, isActive) => {
//   try {
//     await db.collection('ai_generated_plans').doc(planId).update({
//       isActive,
//       updatedAt: new Date().toISOString()
//     });
//     return { success: true };
//   } catch (error) {
//     console.error('Error updating plan status:', error);
//     throw error;
//   }
// };

// const savePlan = async (planId, userId, action = 'save') => {
//   try {
//     const updates = {
//       updatedAt: new Date().toISOString()
//     };

//     if (action === 'save') {
//       updates.isSaved = true;
//       updates.savedAt = new Date().toISOString();
//     } else if (action === 'unsave') {
//       updates.isSaved = false;
//       updates.savedAt = null;
//     }

//     await db.collection('ai_generated_plans').doc(planId).update(updates);
    
//     return { 
//       success: true, 
//       message: action === 'save' ? 'Plan saved successfully' : 'Plan unsaved successfully',
//       action: action
//     };
//   } catch (error) {
//     console.error(`Error ${action}ing plan:`, error);
//     throw error;
//   }
// };
// const deletePlanById = async (planId) => {
//   try {
//     const planRef = db.collection('ai_generated_plans').doc(planId);
//     const planDoc = await planRef.get();

//     if (!planDoc.exists) {
//       return { success: false, message: 'Plan not found' };
//     }

//     await planRef.delete();
//     return { success: true, message: 'Plan deleted successfully' };
//   } catch (error) {
//     console.error('Error deleting plan:', error);
//     throw new Error('Failed to delete plan');
//   }
// };
// module.exports = {
//   generatePersonalizedPlan,
//   getUserGeneratedPlan,
//   updatePlanStatus,
//   savePlan,deletePlanById
// };





const { db } = require('../Firebase/firebaseAdmin');


const cleanObjectForFirestore = (obj) => {
  if (obj === null || obj === undefined) return null;

  if (Array.isArray(obj)) return obj.map(item => cleanObjectForFirestore(item));

  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) cleaned[key] = cleanObjectForFirestore(value);
    }
    return cleaned;
  }

  return obj;
};


const mapUserLevelToDifficulty = (userLevel) => {
  if (!userLevel) return 'beginner';
  switch (userLevel.toLowerCase()) {
    case 'beginner': return 'beginner';
    case 'intermediate': return 'Intermediate';
    case 'hard': return 'Hard';
    default: return 'beginner';
  }
};



const generatePersonalizedPlan = async (userParams) => {
  const { age, weight, level, equippment, userId } = userParams;

  try {
    // Check if user already has ANY plan (saved or unsaved)
    const existingPlansSnapshot = await db.collection('ai_generated_plans')
      .where('userId', '==', userId)
      .where('type', '==', 'ai_generated')
      .get();

    // Delete ALL existing plans for this user (this will replace the current plan)
    // This maintains the "one plan per user" rule regardless of save status
    const deletePromises = existingPlansSnapshot.docs.map(doc => 
      db.collection('ai_generated_plans').doc(doc.id).delete()
    );
    await Promise.all(deletePromises);

    const videosSnapshot = await db.collectionGroup('videos').get();
    if (videosSnapshot.empty) throw new Error('No videos available in database');

    const filteredVideos = [];
    videosSnapshot.forEach(doc => {
      const videoData = doc.data();
      const userDifficultyLevel = mapUserLevelToDifficulty(level);

      const matchesDifficulty =
        videoData.difficulty === userDifficultyLevel ||
        (!videoData.difficulty && level.toLowerCase() === 'beginner');

      const matchesEquipment =
        !equippment ||
        videoData.equipment === equippment ||
        (Array.isArray(videoData.equipment) && videoData.equipment.includes(equippment));

      if (matchesDifficulty && matchesEquipment) {
        filteredVideos.push({
          id: doc.id,
          ...videoData,
          path: doc.ref.path
        });
      }
    });

    if (filteredVideos.length === 0) throw new Error('No suitable videos found for user parameters');

    const monthlyPlan = generateMonthlyPlan(filteredVideos, userParams);
    const cleanedPlan = cleanObjectForFirestore(monthlyPlan);

    const planData = {
      userId,
      userParams: { age, weight, level, equippment },
      plan: cleanedPlan,
      createdAt: new Date().toISOString(),
      type: 'ai_generated',
      totalWeeks: 4,
      isActive: true,
      isSaved: false // Default to not saved, user can save it later
    };

    const cleanedPlanData = cleanObjectForFirestore(planData);
    const planRef = await db.collection('ai_generated_plans').add(cleanedPlanData);

    return { id: planRef.id, ...cleanedPlanData };

  } catch (error) {
    console.error('Error generating personalized plan:', error);
    throw error;
  }
};

// New function to clean up unsaved plans on logout
const cleanupUnsavedPlansOnLogout = async (userId) => {
  try {
    // Find and delete only NON-SAVED plans for this user when they log out
    const unsavedPlansSnapshot = await db.collection('ai_generated_plans')
      .where('userId', '==', userId)
      .where('type', '==', 'ai_generated')
      .where('isSaved', '==', false)
      .get();

    const deletePromises = unsavedPlansSnapshot.docs.map(doc => 
      db.collection('ai_generated_plans').doc(doc.id).delete()
    );
    
    await Promise.all(deletePromises);
    
    return { 
      success: true, 
      deletedPlans: unsavedPlansSnapshot.size,
      message: `Cleaned up ${unsavedPlansSnapshot.size} unsaved plans for user ${userId}` 
    };
  } catch (error) {
    console.error('Error cleaning up unsaved plans:', error);
    throw error;
  }
};

// Updated function to get user's single plan
const getUserGeneratedPlan = async (userId) => {
  try {
    const planSnapshot = await db.collection('ai_generated_plans')
      .where('userId', '==', userId)
      .get();

    if (planSnapshot.empty) return null;

   
    return planSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user plan:', error);
    throw error;
  }
};

// New function to check if user can generate a new plan
const canUserGenerateNewPlan = async (userId) => {
  try {
    const existingPlansSnapshot = await db.collection('ai_generated_plans')
      .where('userId', '==', userId)
      .where('type', '==', 'ai_generated')
      .get();

    return {
      canGenerate: true, // Always true since we replace existing plans
      hasExistingPlan: !existingPlansSnapshot.empty,
      existingPlanCount: existingPlansSnapshot.size,
      message: existingPlansSnapshot.empty 
        ? 'No existing plan found. New plan will be created.' 
        : 'Existing plan will be replaced with new plan.'
    };
  } catch (error) {
    console.error('Error checking user plan status:', error);
    throw error;
  }
};


const generateMonthlyPlan = (videos, userParams) => {
  const { age, weight, level, equipment } = userParams;
  const workoutIntensity = calculateWorkoutIntensity(age, weight, level, equipment);
  const videosByCategory = groupVideosByAttackMuscle(videos);

  const weeks = [];
  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const week = { weekNumber: weekNum, workouts: [] };

    for (let dayNum = 1; dayNum <= 7; dayNum++) {
      if (shouldHaveWorkout(dayNum, weekNum, level)) {
        const workout = generateDailyWorkout(
          videosByCategory,
          weekNum,
          dayNum + (weekNum - 1) * 7,
          workoutIntensity
        );
        if (workout.exercises.length > 0) week.workouts.push(workout);
      } else {
        week.workouts.push({ day: dayNum, type: 'rest', name: 'Rest Day', exercises: [] });
      }
    }
    weeks.push(week);
  }

  return {
    totalWeeks: 4,
    weeks,
    summary: {
      totalWorkouts: weeks.reduce((total, week) =>
        total + week.workouts.filter(w => w.type !== 'rest').length, 0),
      avgWorkoutsPerWeek: Math.round(weeks.reduce((total, week) =>
        total + week.workouts.filter(w => w.type !== 'rest').length, 0) / 4)
    }
  };
};


const calculateWorkoutIntensity = (age, weight, level) => {
  let baseIntensity = 1;
  if (age < 25) baseIntensity += 0.3;
  else if (age < 35) baseIntensity += 0.2;
  else if (age < 45) baseIntensity += 0.1;
  else if (age > 55) baseIntensity -= 0.2;

  switch (level.toLowerCase()) {
    case 'beginner': baseIntensity *= 0.7; break;
    case 'intermediate': baseIntensity *= 1.0; break;
    case 'hard': baseIntensity *= 1.3; break;
  }

  return Math.max(0.5, Math.min(2.0, baseIntensity));
};


const groupVideosByAttackMuscle = (videos) => {
  const grouped = {};
  videos.forEach(video => {
    const category = video.atackId || 'general';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(video);
  });
  return grouped;
};


const shouldHaveWorkout = (dayNum, weekNum, level) => {
  const workoutDays = {
    beginner: [1, 3, 5],
    intermediate: [1, 2, 4, 5],
    hard: [1, 2, 3, 4, 5, 6]
  };
  return workoutDays[level.toLowerCase()]?.includes(dayNum) || false;
};


const generateDailyWorkout = (videosByCategory, weekNum, globalDayNum, intensity) => {
  const categories = Object.keys(videosByCategory);
  const exercises = [];

  if (categories.length === 0) return { day: globalDayNum, type: 'rest', name: `Day ${globalDayNum} - Rest`, exercises: [] };

  const focusCategory = categories[(globalDayNum - 1) % categories.length];
  const exerciseCount = Math.floor(4 + (intensity * 2));
  const categoryVideos = videosByCategory[focusCategory] || [];
  const primaryExercises = selectRandomVideos(categoryVideos, exerciseCount);

  let secondaryExercises = [];
  if (primaryExercises.length < exerciseCount) {
    const otherCategories = categories.filter(cat => cat !== focusCategory);
    const secondaryPool = otherCategories.flatMap(cat => videosByCategory[cat] || []);
    secondaryExercises = selectRandomVideos(secondaryPool, exerciseCount - primaryExercises.length);
  }

  const allExercises = [...primaryExercises, ...secondaryExercises];
  allExercises.forEach((video, index) => {
    exercises.push({
      order: index + 1,
      videoId: video.id || `video_${index + 1}`,
      name: video.name || `Exercise ${index + 1}`,
      duration: video.duration || '30s',
      sets: calculateSets(intensity, weekNum),
      reps: calculateReps(intensity, video.duration),
      restTime: calculateRestTime(intensity),
      videoData: {
        url: video.videoUrl || null,
        thumbnail: video.imageUrl || video.thumbnail || null,
        difficulty: video.difficulty || 'easy',
        equipment: video.equipment || 'none',
        muscleAttack: video.muscleAttack || 'general',
        typeId: video.typeId || null,
        categoryId: video.categorieId || null,
        exerciseId: video.exerciceId || null,
        atackId: video.atackId || focusCategory,
        levelId: video.levelId || null
      }
    });
  });

  return {
    day: globalDayNum,
    type: 'workout',
    name: `Day ${globalDayNum} - ${focusCategory} Focus`,
    focusArea: focusCategory,
    estimatedDuration: calculateTotalWorkoutTime(exercises),
    exercises
  };
};


const selectRandomVideos = (videos, count) => {
  if (!videos || videos.length === 0) return [];
  const shuffled = [...videos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, videos.length));
};

const calculateSets = (intensity, weekNum) => {
  const baseSets = 2 + Math.floor(intensity);
  const progressiveSets = Math.floor(weekNum / 2);
  return Math.min(5, Math.max(1, baseSets + progressiveSets));
};

const calculateReps = (intensity, duration) => {
  if (typeof duration === 'string' && duration.includes('s')) return duration;
  const baseReps = 10 + Math.floor(intensity * 5);
  return `${baseReps}-${baseReps + 5}`;
};

const calculateRestTime = (intensity) => {
  const baseRest = 60;
  const adjustedRest = baseRest - (intensity * 10);
  return `${Math.max(30, adjustedRest)}s`;
};

const calculateTotalWorkoutTime = (exercises) => {
  const totalMinutes = exercises.length * 2;
  return `${totalMinutes}-${totalMinutes + 10} minutes`;
};


const updatePlanStatus = async (planId, isActive) => {
  try {
    await db.collection('ai_generated_plans').doc(planId).update({
      isActive,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating plan status:', error);
    throw error;
  }
};

const savePlan = async (planId, userId, action = 'save') => {
  try {
    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (action === 'save') {
      updates.isSaved = true;
      updates.savedAt = new Date().toISOString();
    } else if (action === 'unsave') {
      updates.isSaved = false;
      updates.savedAt = null;
    }

    await db.collection('ai_generated_plans').doc(planId).update(updates);
    
    return { 
      success: true, 
      message: action === 'save' ? 'Plan saved successfully' : 'Plan unsaved successfully',
      action: action
    };
  } catch (error) {
    console.error(`Error ${action}ing plan:`, error);
    throw error;
  }
};

const deletePlanById = async (planId) => {
  try {
    const planRef = db.collection('ai_generated_plans').doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      return { success: false, message: 'Plan not found' };
    }

    await planRef.delete();
    return { success: true, message: 'Plan deleted successfully' };
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw new Error('Failed to delete plan');
  }
};

module.exports = {
  generatePersonalizedPlan,
  getUserGeneratedPlan,
  updatePlanStatus,
  savePlan,
  deletePlanById
};