// server/schedulers/dailyAllowance.scheduler.js
const cron = require('node-cron');
const User = require('../models/user.model');
const DailyAllowance = require('../models/dailyAllowance.model');
const RoleAllowance = require('../models/roleAllowance.model');
const { format } = require('date-fns');

/**
 * Scheduler to automatically create daily allowances for all active users
 * Runs every day at 5:00 PM
 */
const scheduleDailyAllowance = () => {
  console.log('Daily allowance scheduler initialized');
  
  // Schedule task to run at 5:00 PM every day
  cron.schedule('0 17 * * *', async () => {
    console.log('Running scheduled daily allowance creation at:', new Date());
    
    try {
      // Get all active users
      const users = await User.findAll({ isActive: true });
      
      // Current date in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Create daily allowances for each user
      for (const user of users) {
        try {
          // Check if user already has an allowance for today
          const existingAllowance = await DailyAllowance.findExistingAllowance(
            user.id, 
            today
          );
          
          if (existingAllowance) {
            console.log(`User ${user.id} already has a daily allowance for today`);
            continue;
          }
          
          // Get the allowance amount for user's role
          const allowanceAmount = await RoleAllowance.getDailyAllowanceForUser(user.id);
          
          if (!allowanceAmount) {
            console.log(`No allowance configured for user ${user.id} with role ${user.role}`);
            continue;
          }
          
          // Create the allowance
          await DailyAllowance.create({
            userId: user.id,
            date: today,
            amount: allowanceAmount,
            remarks: 'Auto-generated daily allowance',
            status: 'APPROVED' // Auto-approve daily allowances
          });
          
          console.log(`Created daily allowance for user ${user.id}`);
        } catch (userError) {
          console.error(`Error creating allowance for user ${user.id}:`, userError);
          // Continue with other users even if one fails
        }
      }
      
      console.log('Completed daily allowance creation');
    } catch (error) {
      console.error('Error in daily allowance scheduler:', error);
    }
  });
};

module.exports = scheduleDailyAllowance;