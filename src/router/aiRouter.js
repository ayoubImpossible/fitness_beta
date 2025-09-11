// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const { generateFitnessPlan } = require("../Controller/generateAi");

router.post("/generate-plan", generateFitnessPlan);

module.exports = router;
