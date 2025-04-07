const DailyAllowance = require('../models/dailyAllowance.model');
const TravelAllowance = require('../models/travelAllowance.model');
const User = require('../models/user.model');
const { format, subMonths, startOfMonth, endOfMonth } = require('date-fns');

// Get dashboard analytics data
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const isManager = ['ABM', 'RBM', 'ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    
    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);
    const lastDayOfMonth = endOfMonth(now);
    const firstDayOfLastMonth = startOfMonth(subMonths(now, 1));
    const lastDayOfLastMonth = endOfMonth(subMonths(now, 1));
    
    // Get daily allowance totals
    const daApproved = await DailyAllowance.getTotalsByUser(userId, firstDayOfMonth, lastDayOfMonth);
    const daPending = await DailyAllowance.findPendingApprovals(userId);
    
    // Get travel allowance totals
    const taApproved = await TravelAllowance.getTotalsByUser(userId, firstDayOfMonth, lastDayOfMonth);
    const taPending = await TravelAllowance.findPendingApprovals(userId);
    
    // Get total earnings
    const totalEarningsThisMonth = daApproved + taApproved;
    const totalEarningsLastMonth = await Promise.all([
      DailyAllowance.getTotalsByUser(userId, firstDayOfLastMonth, lastDayOfLastMonth),
      TravelAllowance.getTotalsByUser(userId, firstDayOfLastMonth, lastDayOfLastMonth)
    ]).then(([da, ta]) => da + ta);
    
    // Get pending approvals count for managers
    let pendingApprovals = 0;
    if (isManager) {
      pendingApprovals = await Promise.all([
        DailyAllowance.findPendingApprovals(userId),
        TravelAllowance.findPendingApprovals(userId)
      ]).then(([da, ta]) => da + ta);
    }
    
    // Get monthly breakdown for charts
    // In a real app, this would be fetched from the database
    // For demo purposes, we generate sample data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    
    const daMonthly = [];
    const taMonthly = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const daAmount = Math.floor(Math.random() * 1000) + 500;
      const taAmount = Math.floor(Math.random() * 1500) + 300;
      
      daMonthly.push({
        month: months[monthIndex],
        da: daAmount,
        total: daAmount
      });
      
      taMonthly.push({
        month: months[monthIndex],
        ta: taAmount,
        total: taAmount
      });
    }
    
    // Get top travel routes
    const topRoutes = await TravelAllowance.getTopRoutes(userId, 5);
    
    // Sample recent activity
    const recentActivity = [
      {
        id: 1,
        title: 'Daily Allowance',
        description: 'Your daily allowance request has been approved',
        date: subMonths(now, 0).toISOString(),
        status: 'APPROVED',
        type: 'DA'
      },
      {
        id: 2,
        title: 'Travel Allowance',
        description: 'Your travel request from City A to City B has been approved',
        date: subMonths(now, 0).toISOString(),
        status: 'APPROVED',
        type: 'TA'
      },
      {
        id: 3,
        title: 'Daily Allowance',
        description: 'Your daily allowance request is pending approval',
        date: subMonths(now, 0).toISOString(),
        status: 'PENDING',
        type: 'DA'
      },
      {
        id: 4,
        title: 'Travel Allowance',
        description: 'Your travel request from City C to City D was rejected',
        date: subMonths(now, 0).toISOString(),
        status: 'REJECTED',
        type: 'TA'
      }
    ];
    
    // For managers, get team performance data
    let teamPerformance = [];
    if (isManager) {
      const teamMembers = await User.getTeamMembers(userId);
      
      for (const member of teamMembers) {
        const [daMember, taMember] = await Promise.all([
          DailyAllowance.getTotalsByUser(member.id, firstDayOfMonth, lastDayOfMonth),
          TravelAllowance.getTotalsByUser(member.id, firstDayOfMonth, lastDayOfMonth)
        ]);
        
        teamPerformance.push({
          name: member.full_name,
          role: member.role,
          da: daMember,
          ta: taMember,
          total: daMember + taMember
        });
      }
    }
    
    res.json({
      summary: {
        pendingDA: daPending,
        approvedDA: daApproved,
        pendingTA: taPending,
        approvedTA: taApproved,
        totalEarningsThisMonth,
        totalEarningsLastMonth,
        pendingApprovals
      },
      daMonthly,
      taMonthly,
      topRoutes,
      recentActivity,
      teamPerformance
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ message: 'Failed to get dashboard data' });
  }
};

// Get user analytics data
exports.getUserAnalytics = async (req, res) => {
  // Similar implementation as getDashboardData but with more detailed analytics
  // In a real application, this would include more comprehensive data and filtering options
  res.json({ message: 'User analytics implementation' });
};

// Get team analytics data (for managers)
exports.getTeamAnalytics = async (req, res) => {
  // Implementation for team-level analytics
  res.json({ message: 'Team analytics implementation' });
};

// Get admin analytics data
exports.getAdminAnalytics = async (req, res) => {
  // Implementation for system-wide analytics
  res.json({ message: 'Admin analytics implementation' });
};

// Export analytics data
exports.exportData = async (req, res) => {
  // Implementation for exporting analytics data
  // In a real application, this would generate excel/csv files
  res.json({ message: 'Export data implementation' });
};