const express = require('express');
const {
  
    getAllWorkoutInPlanHandler,
    addWorkoutsToPlanHandler,
    addWorkoutHandler,getWorkoutHandler,
    getWorkoutByIdAndUserHandler,
    addPrepareWorkoutHandler,
    getPrepareWorkoutsHandler,
    addPrepareExerciceHandler,
    getPrepareExercicesByPositionHandler,
    addVideoToPrepareExerciceHandler,
    getVideosForPrepareExerciceHandler,getPrepareExerciceHandler,
    deleteWorkoutByIdHandler
 
} = require('../Controller/WorkoutController');
const upload = require('../middlewares/multer');
const { getPrepareWorkoutByTypeInDB } = require('../models/workout');
const uploade = require('../middlewares/multerFiel');
const { uploadImage } = require('../Utils/Helpers');


const router = express.Router();
router.post('/add/:userId',addWorkoutHandler)
router.get('/all/:userId/:planId', getAllWorkoutInPlanHandler);
router.put("/addWorkouts/:planId", addWorkoutsToPlanHandler);
router.get('/getAllWorkouts/:userId',getWorkoutHandler)
router.get('/getWorkouts/:userId/:workoutId',getWorkoutByIdAndUserHandler)
router.delete('/delete/:id', deleteWorkoutByIdHandler);
router.post('/addPrepareExercice/',uploade,addPrepareExerciceHandler)
router.post('/AddPrepareWorkouts',uploade, addPrepareWorkoutHandler);
router.get('/getPrepareExercice/:exerciceId',getPrepareExerciceHandler)
router.post('/addPrepareExercice/addVideo/:exerciceId',uploade,addVideoToPrepareExerciceHandler)
router.get("/getPrepareExerciceByPosition", getPrepareExercicesByPositionHandler);
router.get('/getPrepareWorkouts/:type',getPrepareWorkoutsHandler)
router.get('/getListeVideosInPrepareExercice/:exerciceId',getVideosForPrepareExerciceHandler)

module.exports = router;