// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const {  createPlan, getPlan, savePlanController, cleanupUnsavedPlansController } = require("../Controller/generateAi");

router.post('/generate', createPlan);
router.get('/user/:userId', getPlan);

// Get user's current active AI plan
// GET /api/ai-plans/user/:userId

// Get specific week from user's plan
// GET /api/ai-plans/user/:userId/week/:weekNumber
//router.get('/user/:userId/week/:weekNumber', getUserPlanWeekHandler);

// Get specific workout (day) from user's plan
// GET /api/ai-plans/user/:userId/week/:weekNumber/day/:day
//router.get('/user/:userId/week/:weekNumber/day/:day', getUserWorkoutHandler);

// Get plan statistics and progress
// GET /api/ai-plans/user/:userId/stats
//router.get('/user/:userId/stats', getPlanStatsHandler);

// Deactivate user's current plan
// DELETE /api/ai-plans/user/:userId/deactivate
//router.delete('/user/:userId/deactivate', deactivateUserPlanHandler);
module.exports = router;
