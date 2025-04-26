const express = require('express');
const {  getAllEquipment, getAllDuration, getAllVideosHandler, getAllDuration_2, getAllEquipment_2, getAllVideoBytime, getAllVideoByeq } = require('../Controller/FilterVideoBy');
const router = express.Router();


router.get('/time/:duration', getAllVideoBytime);
router.get('/byequipment/:equipment',getAllVideoByeq)

router.get('/equipment/:typeId/categories/:categoryId/exercises/:exerciceId', getAllEquipment);
router.get('/duration/:typeId/categories/:categoryId/exercises/:exerciceId', getAllDuration);
router.get('/videos/all',getAllVideosHandler);



router.get('/getAllDuration', getAllDuration_2);
router.get('/getAllEquipment',getAllEquipment_2)
module.exports = router;
