// backend/routes/protected.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../Utils/VerifyToken');

router.post('/', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});

module.exports = router;
