const programService = require('../models/ListePerDayModel');
const { uploadVideoToStorage, uploadImage } = require('../Utils/Helpers');

// ============================================
// PROGRAM CONTROLLERS
// ============================================

const getAllPrograms = async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const programs = await programService.getAllPrograms(forceRefresh);
    
    res.json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    console.error('Error in getAllPrograms:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des programmes'
    });
  }
};

const getProgramById = async (req, res) => {
  try {
    const { programId } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    const program = await programService.getProgramById(programId, forceRefresh);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Programme non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Error in getProgramById:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du programme'
    });
  }
};

const getFullProgramStructure = async (req, res) => {
  try {
    const { programId } = req.params;
    const fullStructure = await programService.getFullProgramStructure(programId);
    
    if (!fullStructure) {
      return res.status(404).json({
        success: false,
        error: 'Programme non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: fullStructure
    });
  } catch (error) {
    console.error('Error in getFullProgramStructure:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la structure complète'
    });
  }
};

const getProgramsByPhaseType = async (req, res) => {
  try {
    const { type } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    if (!['yoga', 'relax', 'musculation','cardio'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type invalide. Types acceptés: yoga, relax, musculation'
      });
    }
    
    const programs = await programService.getProgramsByPhaseType(type, forceRefresh);
    
    res.json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    console.error('Error in getProgramsByPhaseType:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des programmes par type'
    });
  }
};

const getProgramsByMuscle = async (req, res) => {
  try {
    const { muscle } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    const programs = await programService.getProgramsByMuscle(muscle, forceRefresh);
    
    res.json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    console.error('Error in getProgramsByMuscle:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des programmes par muscle'
    });
  }
};

const createProgram = async (req, res) => {
  try {
    const { name, description, exerciseCount } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le nom du programme est requis'
      });
    }
    
    const program = await programService.createProgram({
      name,
      description,
      exerciseCount: exerciseCount || 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Programme créé avec succès',
      data: program
    });
  } catch (error) {
    console.error('Error in createProgram:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du programme'
    });
  }
};

const updateProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const updateData = req.body;
    
    const existingProgram = await programService.getProgramById(programId);
    if (!existingProgram) {
      return res.status(404).json({
        success: false,
        error: 'Programme non trouvé'
      });
    }
    
    await programService.updateProgram(programId, updateData);
    
    res.json({
      success: true,
      message: 'Programme mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error in updateProgram:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du programme'
    });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    
    const existingProgram = await programService.getProgramById(programId);
    if (!existingProgram) {
      return res.status(404).json({
        success: false,
        error: 'Programme non trouvé'
      });
    }
    
    await programService.deleteProgram(programId);
    
    res.json({
      success: true,
      message: 'Programme supprimé avec succès'
    });
  } catch (error) {
    console.error('Error in deleteProgram:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du programme'
    });
  }
};

// ============================================
// PHASE CONTROLLERS
// ============================================

const getPhasesByProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    const phases = await programService.getPhasesByProgram(programId, forceRefresh);
    
    res.json({
      success: true,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    console.error('Error in getPhasesByProgram:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des phases'
    });
  }
};

const getAllPhases = async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const phases = await programService.getAllPhases(forceRefresh);
    
    res.json({
      success: true,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    console.error('Error in getAllPhases:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des phases'
    });
  }
};

const getPhasesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    if (!['yoga', 'relax', 'musculation'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type invalide. Types acceptés: yoga, relax, musculation'
      });
    }
    
    const phases = await programService.getPhasesByType(type, forceRefresh);
    
    res.json({
      success: true,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    console.error('Error in getPhasesByType:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des phases par type'
    });
  }
};

const getPhasesByMuscle = async (req, res) => {
  try {
    const { muscle } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    const phases = await programService.getPhasesByMuscle(muscle, forceRefresh);
    
    res.json({
      success: true,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    console.error('Error in getPhasesByMuscle:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des phases par muscle'
    });
  }
};

const addPhaseToProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const { phaseNumber, type, muscleAttacker, description } = req.body;
    
    if (!phaseNumber || phaseNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de phase doit être >= 1'
      });
    }
    
    if (!type || !['yoga', 'relax', 'musculation','cardio'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Le type doit être: yoga, relax ou musculation'
      });
    }
    
    if (type === 'musculation' && !muscleAttacker) {
      return res.status(400).json({
        success: false,
        error: 'muscleAttacker est requis pour les phases de musculation'
      });
    }
    
    const existingProgram = await programService.getProgramById(programId);
    if (!existingProgram) {
      return res.status(404).json({
        success: false,
        error: 'Programme non trouvé'
      });
    }
    
    const phase = await programService.addPhaseToProgram(programId, {
      phaseNumber,
      type,
      muscleAttacker,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Phase ajoutée avec succès',
      data: phase
    });
  } catch (error) {
    console.error('Error in addPhaseToProgram:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la phase'
    });
  }
};

const updatePhase = async (req, res) => {
  try {
    const { programId, phaseId } = req.params;
    const updateData = req.body;
    
    await programService.updatePhase(programId, phaseId, updateData);
    
    res.json({
      success: true,
      message: 'Phase mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error in updatePhase:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la phase'
    });
  }
};

const deletePhase = async (req, res) => {
  try {
    const { programId, phaseId } = req.params;
    
    await programService.deletePhase(programId, phaseId);
    
    res.json({
      success: true,
      message: 'Phase supprimée avec succès'
    });
  } catch (error) {
    console.error('Error in deletePhase:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la phase'
    });
  }
};

// ============================================
// DAY CONTROLLERS
// ============================================

const getDaysByPhase = async (req, res) => {
  try {
    const { programId, phaseId } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    const days = await programService.getDaysByPhase(programId, phaseId, forceRefresh);
    
    res.json({
      success: true,
      count: days.length,
      data: days
    });
  } catch (error) {
    console.error('Error in getDaysByPhase:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des jours'
    });
  }
};

const addDayToPhase = async (req, res) => {
  try {
    const { programId, phaseId } = req.params;
    const { dayNumber, title } = req.body;
    
    if (!dayNumber || dayNumber < 1) {
      return res.status(400).json({
        success: false,
        error: 'Le numéro de jour doit être >= 1'
      });
    }
    
    const day = await programService.addDayToPhase(programId, phaseId, {
      dayNumber,
      title
    });
    
    res.status(201).json({
      success: true,
      message: 'Jour ajouté avec succès',
      data: day
    });
  } catch (error) {
    console.error('Error in addDayToPhase:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du jour'
    });
  }
};

const updateDay = async (req, res) => {
  try {
    const { programId, phaseId, dayId } = req.params;
    const updateData = req.body;
    
    await programService.updateDay(programId, phaseId, dayId, updateData);
    
    res.json({
      success: true,
      message: 'Jour mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error in updateDay:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du jour'
    });
  }
};

const deleteDay = async (req, res) => {
  try {
    const { programId, phaseId, dayId } = req.params;
    
    await programService.deleteDay(programId, phaseId, dayId);
    
    res.json({
      success: true,
      message: 'Jour supprimé avec succès'
    });
  } catch (error) {
    console.error('Error in deleteDay:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du jour'
    });
  }
};

// ============================================
// VIDEO CONTROLLERS
// ============================================

const getVideosByDay = async (req, res) => {
  try {
    const { programId, phaseId, dayId } = req.params;
    const forceRefresh = req.query.refresh === 'true';
    
    const videos = await programService.getVideosByDay(programId, phaseId, dayId, forceRefresh);
    
    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error in getVideosByDay:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des vidéos'
    });
  }
};

const getAllDayVideos = async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const videos = await programService.getAllDayVideos(forceRefresh);
    
    res.json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error in getAllDayVideos:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des vidéos'
    });
  }
};

// const addVideoToDay = async (req, res) => {

//   const videoUrl = await uploadVideoToStorage(req.files.video[0]);
//  const imageUrl = await uploadImage(req.files.image[0]);

//   try {
//     const { programId, phaseId, dayId } = req.params;
//     const {  titre, description, order, duration } = req.body;
    
   
    
     
   
   
    
//     const video = await programService.addVideoToDay(programId, phaseId, dayId, {
//       videoUrl,
//       titre,
//       description,
//       imageUrl,
//       order,
//       duration
//     });
    
//     res.status(201).json({
//       success: true,
//       message: 'Vidéo ajoutée avec succès',
//       data: video
//     });
//   } catch (error) {
//     console.error('Error in addVideoToDay:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Erreur lors de la création de la vidéo'
//     });
//   }
// };


const addVideoToDay = async (req, res) => {
  try {
    const { programId, phaseId, dayId } = req.params;
    const { titre, description, order, duration } = req.body;
    const videoFile = req.files?.video?.[0];
    const imageFile = req.files?.image?.[0];
    
    // Validation des champs requis
    if (!titre || titre.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Le titre de la vidéo est requis'
      });
    }
    
    if (!videoFile) {
      return res.status(400).json({
        success: false,
        error: 'Le fichier vidéo est requis'
      });
    }
    
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'Le fichier image est requis'
      });
    }
    
    // Log file sizes for debugging
    console.log('📦 Video file size:', (videoFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('📦 Image file size:', (imageFile.size / 1024).toFixed(2), 'KB');
    
    // Upload des fichiers
    console.log('📤 Uploading video and image...');
    const videoUrl = await uploadVideoToStorage(videoFile);
    console.log('✅ Video uploaded:', videoUrl);
    
    const imageUrl = await uploadImage(imageFile);
    console.log('✅ Image uploaded:', imageUrl);
    
    // Créer la vidéo avec les URLs
    const video = await programService.addVideoToDay(programId, phaseId, dayId, {
      videoUrl,
      titre,
      description: description || '',
      imageUrl,
      order: order ? parseInt(order) : 0,
      duration: duration ? parseInt(duration) : 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Vidéo ajoutée avec succès',
      data: video
    });
  } catch (error) {
    console.error('❌ Error in addVideoToDay:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la création de la vidéo'
    });
  }
};
const updateVideo = async (req, res) => {
  try {
    const { programId, phaseId, dayId, videoId } = req.params;
    const updateData = req.body;
    
    await programService.updateVideo(programId, phaseId, dayId, videoId, updateData);
    
    res.json({
      success: true,
      message: 'Vidéo mise à jour avec succès'
    });
  } catch (error) {
    console.error('Error in updateVideo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la vidéo'
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { programId, phaseId, dayId, videoId } = req.params;
    
    await programService.deleteVideo(programId, phaseId, dayId, videoId);
    
    res.json({
      success: true,
      message: 'Vidéo supprimée avec succès'
    });
  } catch (error) {
    console.error('Error in deleteVideo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la vidéo'
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Program
  getAllPrograms,
  getProgramById,
  getFullProgramStructure,
  getProgramsByPhaseType,
  getProgramsByMuscle,
  createProgram,
  updateProgram,
  deleteProgram,
  
  // Phase
  getPhasesByProgram,
  getAllPhases,
  getPhasesByType,
  getPhasesByMuscle,
  addPhaseToProgram,
  updatePhase,
  deletePhase,
  
  // Day
  getDaysByPhase,
  addDayToPhase,
  updateDay,
  deleteDay,
  
  // Video
  getVideosByDay,
  getAllDayVideos,
  addVideoToDay,
  updateVideo,
  deleteVideo
};