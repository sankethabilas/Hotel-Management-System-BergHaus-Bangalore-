const AutomatedRule = require('../models/automatedRuleModel');
const RuleExecution = require('../models/ruleExecutionModel');
const AutomatedRulesService = require('../services/automatedRulesService');

// Get all rules
exports.getAllRules = async (req, res) => {
  try {
    const { isActive, trigger } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (trigger) {
      filter.trigger = trigger;
    }

    const rules = await AutomatedRule.find(filter)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rules.length,
      rules
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching automated rules',
      error: error.message
    });
  }
};

// Get single rule
exports.getRuleById = async (req, res) => {
  try {
    const rule = await AutomatedRule.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      rule
    });
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rule',
      error: error.message
    });
  }
};

// Create rule
exports.createRule = async (req, res) => {
  try {
    const ruleData = {
      ...req.body,
      createdBy: req.user.id
    };

    const rule = await AutomatedRule.create(ruleData);

    res.status(201).json({
      success: true,
      message: 'Automated rule created successfully',
      rule
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating automated rule',
      error: error.message
    });
  }
};

// Update rule
exports.updateRule = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    const rule = await AutomatedRule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Automated rule updated successfully',
      rule
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating automated rule',
      error: error.message
    });
  }
};

// Delete rule
exports.deleteRule = async (req, res) => {
  try {
    const rule = await AutomatedRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Automated rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting automated rule',
      error: error.message
    });
  }
};

// Test rule
exports.testRule = async (req, res) => {
  try {
    const rule = await AutomatedRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    const testData = req.body;
    const result = await AutomatedRulesService.testRule(rule, testData);

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error testing rule:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing rule',
      error: error.message
    });
  }
};

// Get rule executions
exports.getRuleExecutions = async (req, res) => {
  try {
    const { ruleId, guestId, status, startDate, endDate, limit = 100 } = req.query;
    
    const filter = {};
    
    if (ruleId) {
      filter.ruleId = ruleId;
    }
    if (guestId) {
      filter.guestId = guestId;
    }
    if (status) {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.executedAt = {};
      if (startDate) {
        filter.executedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.executedAt.$lte = new Date(endDate);
      }
    }

    const executions = await RuleExecution.find(filter)
      .populate('ruleId', 'name trigger')
      .populate('loyaltyId', 'guestId tier')
      .sort({ executedAt: -1 })
      .limit(parseInt(limit));

    const stats = await RuleExecution.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsAwarded' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: executions.length,
      executions,
      stats
    });
  } catch (error) {
    console.error('Error fetching rule executions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rule executions',
      error: error.message
    });
  }
};

// Get rule statistics
exports.getRuleStats = async (req, res) => {
  try {
    const [totalRules, activeRules, executionStats] = await Promise.all([
      AutomatedRule.countDocuments(),
      AutomatedRule.countDocuments({ isActive: true }),
      RuleExecution.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalPoints: { $sum: '$pointsAwarded' }
          }
        }
      ])
    ]);

    const topRules = await RuleExecution.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$ruleId',
          executions: { $sum: 1 },
          totalPoints: { $sum: '$pointsAwarded' }
        }
      },
      { $sort: { executions: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'automatedrules',
          localField: '_id',
          foreignField: '_id',
          as: 'rule'
        }
      },
      { $unwind: '$rule' },
      {
        $project: {
          ruleName: '$rule.name',
          trigger: '$rule.trigger',
          executions: 1,
          totalPoints: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRules,
        activeRules,
        executionStats,
        topRules
      }
    });
  } catch (error) {
    console.error('Error fetching rule stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rule statistics',
      error: error.message
    });
  }
};

// Execute rule manually (for testing)
exports.executeRuleManually = async (req, res) => {
  try {
    const rule = await AutomatedRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    const data = req.body;
    const result = await AutomatedRulesService.executeRule(rule, data);

    res.status(200).json({
      success: true,
      message: 'Rule executed manually',
      result
    });
  } catch (error) {
    console.error('Error executing rule manually:', error);
    res.status(500).json({
      success: false,
      message: 'Error executing rule',
      error: error.message
    });
  }
};
