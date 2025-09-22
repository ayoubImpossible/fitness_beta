const { generatePersonalizedPlan, getUserGeneratedPlan, updatePlanStatus, savePlan, cleanupUnsavedPlans } = require('../models/AiPlanModel');
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



const savePlanController = async (req, res) => {
  try {
    console.log('Save plan request:', {
      params: req.params,
      body: req.body,
      method: req.method,
      url: req.url
    });

    const { planId } = req.params;
    const { userId, action = 'save' } = req.body;
    
    // Validate required fields
    if (!planId) {
      console.log('Missing planId');
      return res.status(400).json({
        success: false,
        error: 'Missing plan ID',
        message: 'Plan ID is required in URL parameters'
      });
    }

    if (!userId) {
      console.log('Missing userId');
      return res.status(400).json({
        success: false,
        error: 'Missing user ID',
        message: 'User ID is required in request body'
      });
    }

    // Validate action
    if (!['save', 'unsave'].includes(action)) {
      console.log('Invalid action:', action);
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be either "save" or "unsave"'
      });
    }

    console.log(`Processing ${action} request for plan ${planId} by user ${userId}`);

    // Call the savePlan service
    const result = await savePlan(planId, userId, action);

    console.log('Save plan result:', result);

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
    
    // Handle specific errors
    if (error.message === 'Plan not found') {
      return res.status(404).json({
        success: false,
        error: 'Plan not found',
        message: 'The specified plan does not exist'
      });
    }
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only modify your own plans'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save plan. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const cleanupUnsavedPlansController = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Cleanup request for user:', userId);
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing user ID',
        message: 'User ID is required'
      });
    }

    // Call the cleanup function
    const result = await cleanupUnsavedPlans(userId);
    
    return res.status(200).json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error in cleanupUnsavedPlansController:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to cleanup unsaved plans'
    });
  }
};


module.exports = { createPlan, getPlan, updatePlan,savePlanController,cleanupUnsavedPlansController };
