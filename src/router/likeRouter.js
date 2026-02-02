// backend/routes/protected.js
const express = require('express');
const { getLikedPlansHandler, getLikedExercicesHandler } = require('../Controller/LikeController');
const router = express.Router();

router.get('/getAllLikedPlans/:uid',getLikedPlansHandler  );
router.get('/getAllLikedExercices/:uid',getLikedExercicesHandler);

module.exports = router;
