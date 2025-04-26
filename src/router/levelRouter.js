const express = require('express');
const {
  addVideoHandler,
  updateVideoHandler,
  deleteVideoHandler,
  getAllVideosHandler,
  getVideoByIdHandler,
  getAllLevelsHandler,
  addLevelHandler,
  addVideoHandler2,
  getAllVideosInExerciceHandler,
  getVideoByLevelHandler,
  getVideosByDifficultyController,
} = require('../Controller/levelController');
const upload = require('../middlewares/multer');
const uploade = require('../middlewares/multerFiel');
const { getAllVideosInLevel } = require('../models/levelModel');

const router = express.Router();

router.post('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels/:levelId/videos',upload.single('file'), addVideoHandler);
router.post('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels/:levelId/videos2',uploade, addVideoHandler2);
router.put('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels/:levelId/videos/:videoId',upload.single('file'), updateVideoHandler);
router.delete('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels/:levelId/videos/:videoId', deleteVideoHandler);
router.post('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels', addLevelHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels', getAllLevelsHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels/:levelId/videos', getAllVideosHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId/atack/:atackId/levels/:levelId/videos/:videoId', getVideoByIdHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId',getAllVideosInExerciceHandler)
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciseId/level',getVideoByLevelHandler)
router.get('/type/getAllVideoInLevel/:difficulty',getVideosByDifficultyController)



module.exports = router;
