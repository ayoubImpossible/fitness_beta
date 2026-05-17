const express = require('express');
const upload = require('../middlewares/multer');
const { getAllExercisesInCat, getExerciceById, getExerciseByIdWithLevelsAndVideos, addExerciseHandler, updateExerciseHandler, deleteExerciseAndImage } = require('../Controller/exerciseControllers');


const router = express.Router();
router.post('/type/:typeId/categories/:categoryId/exercices', upload.single('file'), addExerciseHandler);
router.put('/type/:typeId/categories/:categoryId/exercice/:exerciseId', upload.single('file'), updateExerciseHandler);
router.delete('/type/:typeId/categories/:categoryId/exercices/:exerciseId', deleteExerciseAndImage);

router.get('/type/:typeId/categories/:categoryId', getAllExercisesInCat);
router.get('/type/:typeId/categories/:categoryId/exercice/:exerciceId', getExerciceById);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId', getExerciseByIdWithLevelsAndVideos);




module.exports = router;



