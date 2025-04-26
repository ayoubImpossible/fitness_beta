const express = require('express');
const {
    addatackHandler,
    updateAtackHandler,
    deleteAtackHandler,
    getAllAtacksHandler,
    getAtackByIdHandler,
    getAllAtackDatasHandler,
    getAllAtacksHandler_2,
    getAllVideoByatack
} = require('../Controller/AtackMuscleController');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/type/:typeId/categories/:categoryId/exercises/:exerciceId/atack/',upload.single('file'), addatackHandler);
router.put('/type/:typeId/categories/:categoryId/exercises/:exerciceId/atack/:atackId/',upload.single('file'), updateAtackHandler);
router.delete('/type/:typeId/categories/:categoryId/exercises/:exerciceId/atack/:atackId/', deleteAtackHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciceId/atack/', getAllAtacksHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciceId/atack/:atackId/', getAtackByIdHandler);
router.get('/type/:typeId/categories/:categoryId/exercises/:exerciceId/atack/:atackId', getAllAtackDatasHandler);//get levels and videos atack by id atack


router.get('/getAllVideoByAtackMuscle/',getAllAtacksHandler_2)
router.get('/getAllVideosInAttack/:muscleAttack',getAllVideoByatack)

module.exports = router;
