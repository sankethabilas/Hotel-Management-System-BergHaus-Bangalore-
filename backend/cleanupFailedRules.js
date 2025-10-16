const mongoose = require('mongoose');
const User = require('./models/User');
const Loyalty = require('./models/loyaltyModel');
const RuleExecution = require('./models/ruleExecutionModel');
const PointTransaction = require('./models/pointTransactionModel');
const connectDB = require('./config/database');
require('dotenv').config();

const cleanupAndReset = async (email) => {
  try {
    await connectDB();
    console.log('MongoDB Connected...\n');

    const user = await User.findOne({ email: email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log('🧹 CLEANING UP FAILED EXECUTIONS\n');
    console.log('👤 Guest:', `${user.firstName} ${user.lastName} (${user.email})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Delete failed rule executions
    const deletedExecutions = await RuleExecution.deleteMany({
      guestId: user._id,
      status: { $in: ['failed', 'skipped'] }
    });
    console.log(`✅ Deleted ${deletedExecutions.deletedCount} failed/skipped execution records`);

    // Delete any automated point transactions that might have failed
    const deletedTransactions = await PointTransaction.deleteMany({
      guestId: user._id,
      description: { $regex: /^Automated:/ }
    });
    console.log(`✅ Deleted ${deletedTransactions.deletedCount} automated transaction records`);

    // Reset loyalty points to 0 for fresh start
    const loyalty = await Loyalty.findOne({ userId: user._id });
    if (loyalty) {
      const oldPoints = loyalty.points;
      loyalty.points = 0;
      await loyalty.save();
      console.log(`✅ Reset points from ${oldPoints} → 0`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ CLEANUP COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Next steps:');
    console.log('   1. RESTART the backend server (npm start)');
    console.log('   2. Create a NEW booking with this email');
    console.log('   3. Rules should now work correctly!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

const email = process.argv[2] || 'testguesttest@gmail.com';
console.log(`\n🔄 Cleaning up data for: ${email}\n`);
cleanupAndReset(email);
