const express = require('express');
const programController = require('../Controller/PerDayListeController');
const uploade = require('../middlewares/multerFiel');
const {
  
   addVideoToDay
 
} = require('../Controller/PerDayListeController');
const router = express.Router();

// ============================================
// PROGRAM ROUTES
// ============================================
router.get('/programs', programController.getAllPrograms);
router.get('/programs/:programId', programController.getProgramById);
router.get('/programs/:programId/full', programController.getFullProgramStructure);
router.get('/programs/by-type/:type', programController.getProgramsByPhaseType);
router.get('/programs/by-muscle/:muscle', programController.getProgramsByMuscle);
router.post('/programs', programController.createProgram);
router.put('/programs/:programId', programController.updateProgram);
router.delete('/programs/:programId', programController.deleteProgram);
router.patch('/programs/:planId/:uid', programController.updatePlanLikeStatus);

// ============================================
// PHASE ROUTES
// ============================================
router.get('/programs/:programId/phases', programController.getPhasesByProgram);
router.get('/phases', programController.getAllPhases);
router.get('/phases/by-type/:type', programController.getPhasesByType);
router.get('/phases/by-muscle/:muscle', programController.getPhasesByMuscle);
router.post('/programs/:programId/phases', programController.addPhaseToProgram);
router.put('/programs/:programId/phases/:phaseId', programController.updatePhase);
router.delete('/programs/:programId/phases/:phaseId', programController.deletePhase);

// ============================================
// DAY ROUTES
// ============================================
router.get('/programs/:programId/phases/:phaseId/days', programController.getDaysByPhase);
router.post('/programs/:programId/phases/:phaseId/days', programController.addDayToPhase);
router.put('/programs/:programId/phases/:phaseId/days/:dayId', programController.updateDay);
router.delete('/programs/:programId/phases/:phaseId/days/:dayId', programController.deleteDay);

// ============================================
// VIDEO ROUTES
// ============================================
router.get('/programs/:programId/phases/:phaseId/days/:dayId/videos', programController.getVideosByDay);
router.get('/videos', programController.getAllDayVideos);
router.post('/programs/:programId/phases/:phaseId/days/:dayId/videos',uploade, addVideoToDay);
router.put('/programs/:programId/phases/:phaseId/days/:dayId/videos/:videoId', programController.updateVideo);
router.delete('/programs/:programId/phases/:phaseId/days/:dayId/videos/:videoId', programController.deleteVideo);

module.exports = router;