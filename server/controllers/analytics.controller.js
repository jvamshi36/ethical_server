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
    let daApproved = await DailyAllowance.getTotalsByUser(userId, firstDayOfMonth, lastDayOfMonth);
    let daPending = await DailyAllowance.findPendingApprovals(userId);
    
    // Get travel allowance totals
    let taApproved = await TravelAllowance.getTotalsByUser(userId, firstDayOfMonth, lastDayOfMonth);
    let taPending = await TravelAllowance.findPendingApprovals(userId);
    
    // Ensure we have valid numbers to avoid toFixed() errors
    daApproved = daApproved || 0;
    daPending = daPending || 0;
    taApproved = taApproved || 0;
    taPending = taPending || 0;
    
    // Get total earnings
    const totalEarningsThisMonth = daApproved + taApproved;
    let totalEarningsLastMonth = 0;
    
    try {
      const [da, ta] = await Promise.all([
        DailyAllowance.getTotalsByUser(userId, firstDayOfLastMonth, lastDayOfLastMonth),
        TravelAllowance.getTotalsByUser(userId, firstDayOfLastMonth, lastDayOfLastMonth)
      ]);
      totalEarningsLastMonth = (da || 0) + (ta || 0);
    } catch (err) {
      console.error('Error calculating last month earnings:', err);
      // Default to 0 if there's an error
    }
    
    // Get pending approvals count for managers
    let pendingApprovals = 0;
    if (isManager) {
      try {
        const [da, ta] = await Promise.all([
          DailyAllowance.findPendingApprovals(userId),
          TravelAllowance.findPendingApprovals(userId)
        ]);
        pendingApprovals = (da || 0) + (ta || 0);
      } catch (err) {
        console.error('Error calculating pending approvals:', err);
        // Default to 0 if there's an error
      }
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
    
    // Get top travel routes or initialize empty array
    let topRoutes = [];
    try {
      topRoutes = await TravelAllowance.getTopRoutes(userId, 5) || [];
    } catch (err) {
      console.error('Error fetching top routes:', err);
    }
    
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
      try {
        const teamMembers = await User.getTeamMembers(userId) || [];
        
        for (const member of teamMembers) {
          let daMember = 0;
          let taMember = 0;
          
          try {
            [daMember, taMember] = await Promise.all([
              DailyAllowance.getTotalsByUser(member.id, firstDayOfMonth, lastDayOfMonth),
              TravelAllowance.getTotalsByUser(member.id, firstDayOfMonth, lastDayOfMonth)
            ]);
          } catch (err) {
            console.error(`Error calculating totals for team member ${member.id}:`, err);
          }
          
          // Ensure we have valid numbers
          daMember = daMember || 0;
          taMember = taMember || 0;
          
          teamPerformance.push({
            name: member.full_name,
            role: member.role,
            da: daMember,
            ta: taMember,
            total: daMember + taMember
          });
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
      }
    }
    
    // Prepare data for charts
    const statusDistribution = [
      { name: 'Approved', value: (daApproved + taApproved) || 0 },
      { name: 'Pending', value: (daPending + taPending) || 0 }
    ];
    
    const categoryDistribution = [
      { name: 'Daily Allowance', value: daApproved || 0 },
      { name: 'Travel Allowance', value: taApproved || 0 }
    ];
    
    const monthlyExpenses = daMonthly.map((item, index) => ({
      name: item.month,
      da: item.da,
      ta: taMonthly[index].ta,
      total: item.da + taMonthly[index].ta
    }));
    
    res.json({
      summary: {
        totalDA: daApproved || 0,
        totalTA: taApproved || 0,
        totalAmount: totalEarningsThisMonth || 0,
        totalEarningsThisMonth: totalEarningsThisMonth || 0,
        totalEarningsLastMonth: totalEarningsLastMonth || 0,
        pendingDA: daPending || 0,
        approvedDA: daApproved || 0,
        pendingTA: taPending || 0,
        approvedTA: taApproved || 0,
        pendingApprovals: pendingApprovals || 0,
        approvalRate: calculateApprovalRate(daApproved, taApproved, daPending, taPending) || 0,
        recentActivity
      },
      charts: {
        monthlyExpenses,
        categoryDistribution,
        statusDistribution
      },
      daMonthly,
      taMonthly,
      topRoutes,
      recentActivity,
      teamPerformance
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    // Return default data structure to avoid frontend errors
    res.status(200).json({
      summary: {
        totalDA: 0,
        totalTA: 0,
        totalAmount: 0,
        totalEarningsThisMonth: 0,
        totalEarningsLastMonth: 0,
        pendingDA: 0,
        approvedDA: 0,
        pendingTA: 0,
        approvedTA: 0,
        pendingApprovals: 0,
        approvalRate: 0,
        recentActivity: []
      },
      charts: {
        monthlyExpenses: [],
        categoryDistribution: [],
        statusDistribution: []
      },
      daMonthly: [],
      taMonthly: [],
      topRoutes: [],
      recentActivity: [],
      teamPerformance: []
    });
  }
};

// Helper function to calculate approval rate
function calculateApprovalRate(daApproved, taApproved, daPending, taPending) {
  const totalApproved = (daApproved || 0) + (taApproved || 0);
  const totalPending = (daPending || 0) + (taPending || 0);
  const total = totalApproved + totalPending;
  
  if (total === 0) return 0;
  return (totalApproved / total) * 100;
}

// Get user analytics data
exports.getUserAnalytics = async (req, res) => {
  try {
    // Implement detailed user analytics here
    // For now, return a simple response structure
    res.json({
      summary: {
        totalDA: 0,
        totalTA: 0,
        totalAmount: 0,
        approvalRate: 0
      },
      charts: {
        monthlyExpenses: [],
        categoryDistribution: [],
        statusDistribution: []
      }
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Failed to get user analytics' });
  }
};

// Get team analytics data (for managers)
exports.getTeamAnalytics = async (req, res) => {
  try {
    // Implement team analytics here
    // For now, return a simple response structure
    res.json({
      summary: {
        totalDA: 0,
        totalTA: 0,
        totalAmount: 0,
        approvalRate: 0
      },
      teamMembers: [],
      charts: {
        teamPerformance: [],
        monthlyComparison: []
      }
    });
  } catch (error) {
    console.error('Error getting team analytics:', error);
    res.status(500).json({ message: 'Failed to get team analytics' });
  }
};

// Get admin analytics data
exports.getAdminAnalytics = async (req, res) => {
  try {
    // Implement admin analytics here
    // For now, return a simple response structure
    res.json({
      summary: {
        totalUsers: 0,
        activeUsers: 0,
        totalAllowances: 0,
        pendingApprovals: 0
      },
      charts: {
        userDistribution: [],
        allowanceDistribution: [],
        departmentComparison: []
      }
    });
  } catch (error) {
    console.error('Error getting admin analytics:', error);
    res.status(500).json({ message: 'Failed to get admin analytics' });
  }
};

// Export analytics data
exports.exportData = async (req, res) => {
  try {
    // Implementation for exporting analytics data would go here
    // For now, return a simple message
    res.json({ message: 'Export data implementation' });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};