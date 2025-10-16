const mongoose = require('mongoose');
const AutomatedRule = require('./models/automatedRuleModel');
const RuleExecution = require('./models/ruleExecutionModel');
const PointTransaction = require('./models/pointTransactionModel');
const User = require('./models/User');
const Loyalty = require('./models/loyaltyModel');
const connectDB = require('./config/database');
require('dotenv').config();

const diagnoseRules = async (email) => {
  try {
    await connectDB();
    console.log('MongoDB Connected...\n');

    // Find the user
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              AUTOMATED RULES DIAGNOSTICS                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('👤 Guest:', `${user.firstName} ${user.lastName} (${user.email})`);
    console.log('🆔 User ID:', user._id.toString());
    console.log('\n' + '─'.repeat(60) + '\n');

    // Check loyalty enrollment
    const loyalty = await Loyalty.findOne({ userId: user._id });
    if (loyalty) {
      console.log('✅ LOYALTY STATUS:');
      console.log('   Enrolled: Yes');
      console.log('   Tier:', loyalty.tier);
      console.log('   Current Points:', loyalty.points);
      console.log('   Loyalty ID:', loyalty._id.toString());
    } else {
      console.log('❌ LOYALTY STATUS: Not enrolled');
      console.log('   ⚠️  User must be enrolled to trigger rules!');
      process.exit(0);
    }

    console.log('\n' + '─'.repeat(60) + '\n');

    // Check active rules
    const activeRules = await AutomatedRule.find({ isActive: true });
    console.log(`📋 ACTIVE RULES: ${activeRules.length} rule(s)\n`);
    
    if (activeRules.length === 0) {
      console.log('   ⚠️  No active rules found!');
      console.log('   💡 Create rules in CRM → Loyalty Program → Automated Rules\n');
    } else {
      activeRules.forEach((rule, index) => {
        console.log(`   ${index + 1}. ${rule.name}`);
        console.log(`      Trigger: ${rule.trigger}`);
        console.log(`      Action: ${rule.action.type}`);
        if (rule.action.type === 'award_points') {
          console.log(`      Points: ${rule.action.points}`);
        } else if (rule.action.type === 'multiply_points') {
          console.log(`      Multiplier: ${rule.action.multiplier}x`);
        } else if (rule.action.type === 'tier_upgrade') {
          console.log(`      Target Tier: ${rule.action.targetTier}`);
        }
        if (rule.conditions.minBookingAmount) {
          console.log(`      Min Booking: $${rule.conditions.minBookingAmount}`);
        }
        if (rule.conditions.minFeedbackRating) {
          console.log(`      Min Rating: ${rule.conditions.minFeedbackRating}`);
        }
        console.log('');
      });
    }

    console.log('─'.repeat(60) + '\n');

    // Check rule executions for this user
    const executions = await RuleExecution.find({ guestId: user._id })
      .populate('ruleId')
      .sort({ executedAt: -1 })
      .limit(10);
    
    console.log(`🎯 RULE EXECUTIONS: ${executions.length} execution(s)\n`);
    
    if (executions.length === 0) {
      console.log('   ⚠️  No rules have been executed for this guest yet');
      console.log('   💡 Rules trigger when:');
      console.log('      - booking_created: When a booking is created');
      console.log('      - booking_completed: When booking status changes to "completed"');
      console.log('      - feedback_submitted: When feedback is submitted');
      console.log('      - tier_upgraded: When tier is upgraded\n');
    } else {
      executions.forEach((exec, index) => {
        console.log(`   ${index + 1}. ${exec.ruleId?.name || 'Unknown Rule'}`);
        console.log(`      Status: ${exec.status}`);
        console.log(`      Trigger: ${exec.trigger}`);
        console.log(`      Points Awarded: ${exec.pointsAwarded || 0}`);
        console.log(`      Executed: ${exec.executedAt.toLocaleString()}`);
        if (exec.failureReason) {
          console.log(`      Failure: ${exec.failureReason}`);
        }
        console.log('');
      });
    }

    console.log('─'.repeat(60) + '\n');

    // Check point transactions
    const transactions = await PointTransaction.find({ guestId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`💰 POINT TRANSACTIONS: ${transactions.length} transaction(s)\n`);
    
    if (transactions.length === 0) {
      console.log('   No transactions yet\n');
    } else {
      transactions.forEach((trans, index) => {
        console.log(`   ${index + 1}. ${trans.description}`);
        console.log(`      Points: ${trans.points > 0 ? '+' : ''}${trans.points}`);
        console.log(`      Type: ${trans.type}`);
        console.log(`      Date: ${trans.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

const email = process.argv[2] || 'testguesttest@gmail.com';
diagnoseRules(email);
