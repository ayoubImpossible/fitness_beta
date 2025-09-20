const { generatePersonalizedPlan, getUserGeneratedPlan, updatePlanStatus } = require('../models/AiPlanModel');
/**
 * Create new AI-generated plan
 */
const createPlan = async (req, res) => {
  try {
    const { age, weight, level, equippment, userId } = req.body;

    if (!age || !weight || !level || !userId) {
      return res.status(400).json({ error: 'Missing required fields: age, weight, level, userId' });
    }

    const plan = await generatePersonalizedPlan({ age, weight, level, equippment, userId });
    res.status(201).json(plan);
  } catch (error) {
    console.error('Error in createPlan:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get active plan for user
 */
const getPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const plan = await getUserGeneratedPlan(userId);
    if (!plan) return res.status(404).json({ error: 'No active plan found' });

    res.json(plan);
  } catch (error) {
    console.error('Error in getPlan:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update plan status (activate/deactivate)
 */
const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    const result = await updatePlanStatus(planId, isActive);
    res.json(result);
  } catch (error) {
    console.error('Error in updatePlan:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPlan, getPlan, updatePlan };
