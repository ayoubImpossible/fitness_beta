// backend/routes/protected.js
const express = require('express');
const { getLikedPlansHandler } = require('../Controller/LikeController');
const router = express.Router();

router.get('/getAllLikedPlans/:uid',getLikedPlansHandler  );

module.exports = router;
