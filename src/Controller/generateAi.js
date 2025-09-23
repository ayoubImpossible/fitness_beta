const { db } = require('../Firebase/firebaseAdmin');
const { generatePersonalizedPlan, getUserGeneratedPlan, updatePlanStatus, savePlan } = require('../models/AiPlanModel');
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

const savePlanController = async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId, action = 'save' } = req.body;
    
    // Validate required fields
    if (!planId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Plan ID and User ID are required'
      });
    }

    // Validate action
    if (!['save', 'unsave'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be either "save" or "unsave"'
      });
    }

    // Verify plan exists and belongs to user
    const planDoc = await db.collection('ai_generated_plans').doc(planId).get();
    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }

    const planData = planDoc.data();
    if (planData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only modify your own plans'
      });
    }

    // Call the savePlan service
    const result = await savePlan(planId, userId, action);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        planId: planId,
        userId: userId,
        action: action,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in savePlanController:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save plan. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

module.exports = { createPlan, getPlan, updatePlan ,savePlanController};
