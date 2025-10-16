const AutomatedRule = require('../models/automatedRuleModel');
const RuleExecution = require('../models/ruleExecutionModel');
const PointTransaction = require('../models/pointTransactionModel');
const Loyalty = require('../models/loyaltyModel');

class AutomatedRulesService {
  
  /**
   * Execute rules based on trigger
   */
  async executeRules(trigger, data) {
    try {
      // Find active rules for this trigger
      const rules = await AutomatedRule.find({
        isActive: true,
        trigger
      }).sort({ priority: -1 });

      console.log(`Found ${rules.length} active rules for trigger: ${trigger}`);

      const results = [];
      
      for (const rule of rules) {
        const result = await this.executeRule(rule, data);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error executing rules:', error);
      throw error;
    }
  }

  /**
   * Execute a single rule
   */
  async executeRule(rule, data) {
    try {
      const { guestId, loyaltyId, referenceId } = data;

      // Get loyalty member
      const loyalty = await Loyalty.findById(loyaltyId);
      
      if (!loyalty) {
        return this.logExecution(rule, data, 'skipped', 'Loyalty member not found');
      }

      // Check conditions
      if (!this.checkConditions(rule, data, loyalty)) {
        return this.logExecution(rule, data, 'skipped', 'Conditions not met');
      }

      // Check max executions per user
      if (rule.maxExecutionsPerUser) {
        const executionCount = await RuleExecution.countDocuments({
          ruleId: rule._id,
          guestId,
          status: 'success'
        });

        if (executionCount >= rule.maxExecutionsPerUser) {
          return this.logExecution(rule, data, 'skipped', 'Max executions reached for this user');
        }
      }

      // Execute action
      const actionResult = await this.executeAction(rule, data, loyalty);

      // Update rule execution count
      rule.executionCount += 1;
      rule.lastExecuted = new Date();
      await rule.save();

      return this.logExecution(rule, data, 'success', null, actionResult);
    } catch (error) {
      console.error('Error executing rule:', error);
      return this.logExecution(rule, data, 'failed', error.message);
    }
  }

  /**
   * Check if conditions are met
   */
  checkConditions(rule, data, loyalty) {
    const { conditions } = rule;

    // Check tier restrictions
    if (conditions.tierRestrictions && conditions.tierRestrictions.length > 0) {
      if (!conditions.tierRestrictions.includes(loyalty.tier)) {
        return false;
      }
    }

    // Check min booking amount
    if (conditions.minBookingAmount && data.bookingAmount) {
      if (data.bookingAmount < conditions.minBookingAmount) {
        return false;
      }
    }

    // Check min feedback rating
    if (conditions.minFeedbackRating && data.rating) {
      if (data.rating < conditions.minFeedbackRating) {
        return false;
      }
    }

    // Check date range
    if (conditions.dateRange) {
      const now = new Date();
      if (conditions.dateRange.startDate && now < new Date(conditions.dateRange.startDate)) {
        return false;
      }
      if (conditions.dateRange.endDate && now > new Date(conditions.dateRange.endDate)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute action
   */
  async executeAction(rule, data, loyalty) {
    const { action } = rule;
    const { guestId, loyaltyId, referenceType, referenceId } = data;

    switch (action.type) {
      case 'award_points': {
        const points = action.points || 0;
        
        // Update loyalty points
        loyalty.points = (loyalty.points || 0) + points;
        await loyalty.save();

        // Create transaction
        const transaction = await PointTransaction.create({
          guestId,
          loyaltyId,
          points,
          type: 'bonus',
          description: `Automated: ${rule.name}`,
          referenceType: referenceType || 'other',
          referenceId,
          balanceAfter: loyalty.points
        });

        return {
          action: 'award_points',
          pointsAwarded: points,
          transactionId: transaction._id
        };
      }

      case 'multiply_points': {
        const multiplier = action.multiplier || 1;
        const basePoints = data.basePoints || 0;
        const bonusPoints = Math.floor(basePoints * (multiplier - 1));

        if (bonusPoints > 0) {
          loyalty.points = (loyalty.points || 0) + bonusPoints;
          await loyalty.save();

          const transaction = await PointTransaction.create({
            guestId,
            loyaltyId,
            points: bonusPoints,
            type: 'bonus',
            description: `Automated: ${rule.name} (${multiplier}x multiplier)`,
            referenceType: referenceType || 'other',
            referenceId,
            balanceAfter: loyalty.points
          });

          return {
            action: 'multiply_points',
            pointsAwarded: bonusPoints,
            multiplier,
            transactionId: transaction._id
          };
        }
        return {
          action: 'multiply_points',
          pointsAwarded: 0
        };
      }

      case 'tier_upgrade': {
        const targetTier = action.targetTier;
        const tierOrder = ['Silver', 'Gold', 'Platinum'];
        const currentTierIndex = tierOrder.indexOf(loyalty.tier);
        const targetTierIndex = tierOrder.indexOf(targetTier);

        if (targetTierIndex > currentTierIndex) {
          loyalty.tier = targetTier;
          await loyalty.save();

          return {
            action: 'tier_upgrade',
            oldTier: tierOrder[currentTierIndex],
            newTier: targetTier
          };
        }
        return {
          action: 'tier_upgrade',
          skipped: true,
          reason: 'Already at target tier or higher'
        };
      }

      default:
        return {
          action: 'unknown',
          error: 'Unknown action type'
        };
    }
  }

  /**
   * Log rule execution
   */
  async logExecution(rule, data, status, failureReason, actionResult = {}) {
    try {
      const execution = await RuleExecution.create({
        ruleId: rule._id,
        ruleName: rule.name,
        guestId: data.guestId.toString(), // Convert ObjectId to string
        loyaltyId: data.loyaltyId,
        trigger: rule.trigger,
        triggerData: data,
        action: rule.action.type,
        pointsAwarded: actionResult.pointsAwarded || 0,
        transactionId: actionResult.transactionId,
        status,
        failureReason,
        executedAt: new Date()
      });

      return {
        success: status === 'success',
        executionId: execution._id,
        ...actionResult
      };
    } catch (error) {
      console.error('Error logging execution:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test rule without executing
   */
  async testRule(rule, testData) {
    try {
      const loyalty = await Loyalty.findById(testData.loyaltyId);
      
      if (!loyalty) {
        return {
          success: false,
          error: 'Loyalty member not found'
        };
      }

      const conditionsMet = this.checkConditions(rule, testData, loyalty);

      return {
        success: true,
        conditionsMet,
        wouldExecute: conditionsMet,
        estimatedPoints: conditionsMet ? (rule.action.points || 0) : 0,
        loyalty: {
          guestId: loyalty.guestId,
          tier: loyalty.tier,
          currentPoints: loyalty.points
        }
      };
    } catch (error) {
      console.error('Error testing rule:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AutomatedRulesService();
