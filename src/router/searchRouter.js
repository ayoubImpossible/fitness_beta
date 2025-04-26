const express = require('express');
const { searchVideosHandler } = require('../Controller/SearchControler');


const router = express.Router();

router.get('/search/:name', searchVideosHandler); // GET /videos/search?name=Push

module.exports = router;
