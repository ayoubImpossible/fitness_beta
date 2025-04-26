const express = require('express');
const { getUserProfile } = require('../Controller/UserController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile/:userId', verifyToken, getUserProfile);

module.exports = router;
