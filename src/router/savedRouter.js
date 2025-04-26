// backend/routes/protected.js
const express = require('express');
const { getSavedCategoriesHandler } = require('../Controller/SavedController');
const router = express.Router();

router.get('/getAllSavedCategories/:uid',getSavedCategoriesHandler  );

module.exports = router;
