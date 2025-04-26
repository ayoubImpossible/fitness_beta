const express = require('express');
const { getAllExercisesInCat, getExerciceById, removeExercise, getExerciseByIdWithLevelsAndVideos, updateExerciseNameHandler, addExerciseHandler, updateExerciseHandler, deleteExerciseAndImage } = require('../Controller/exerciseControllers');

const { exerciseCreationValidation, validate } = require('../../validators/exerciceValidator');
const  verifyToken  = require('../middlewares/authMiddleware');
const upload  = require('../middlewares/multer'); // Assuming you have multer setup


const router = express.Router();
router.post('/type/:typeId/categories/:categoryId/exercices',upload.single('file'), addExerciseHandler);
router.put('/type/:typeId/categories/:categoryId/exercice/:exerciseId',upload.single('file'), updateExerciseHandler);
router.delete('/type/:typeId/categories/:categoryId/exercices/:exerciseId', deleteExerciseAndImage);
router.get('/type/:typeId/categories/:categoryId', getAllExercisesInCat);
router.get('/type/:typeId/categories/:categoryId/exercice/:exerciceId', getExerciceById);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId', getExerciseByIdWithLevelsAndVideos);



module.exports = router;



