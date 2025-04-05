import { UserRole } from '../../shared/types/user.js';

export class AccessControlService {
  /**
   * Determines if a user can view another user based on roles and headquarters
   */
  canViewUser(viewerRole, viewerHeadquarters, targetUserRole, targetUserHeadquarters) {
    // Super Admin can view everyone
    if (viewerRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Admin can view everyone in their headquarters
    if (viewerRole === UserRole.ADMIN) {
      return viewerHeadquarters === targetUserHeadquarters;
    }

    // Department Head can view everyone in their headquarters
    if (viewerRole === UserRole.DEPARTMENT_HEAD) {
      return viewerHeadquarters === targetUserHeadquarters;
    }

    // Team Lead can view Seniors, Juniors, and Trainees in their headquarters
    if (viewerRole === UserRole.TEAM_LEAD) {
      return (
        viewerHeadquarters === targetUserHeadquarters &&
        [UserRole.SENIOR, UserRole.JUNIOR, UserRole.TRAINEE].includes(targetUserRole)
      );
    }

    // Senior can view Juniors and Trainees in their headquarters
    if (viewerRole === UserRole.SENIOR) {
      return (
        viewerHeadquarters === targetUserHeadquarters &&
        [UserRole.JUNIOR, UserRole.TRAINEE].includes(targetUserRole)
      );
    }

    // Junior and Trainee can't view other users
    return false;
  }

  /**
   * Determines if a user can approve an expense
   */
  canApproveExpense(approverRole, approverHeadquarters, expenseUserRole, expenseUserHeadquarters) {
    // Super Admin can approve all expenses
    if (approverRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Admin can approve expenses in their headquarters
    if (approverRole === UserRole.ADMIN) {
      return approverHeadquarters === expenseUserHeadquarters;
    }

    // Department Head can approve expenses for users in their headquarters
    if (approverRole === UserRole.DEPARTMENT_HEAD) {
      return approverHeadquarters === expenseUserHeadquarters;
    }

    // Team Lead can approve expenses for Seniors, Juniors, and Trainees in their headquarters
    if (approverRole === UserRole.TEAM_LEAD) {
      return (
        approverHeadquarters === expenseUserHeadquarters &&
        [UserRole.SENIOR, UserRole.JUNIOR, UserRole.TRAINEE].includes(expenseUserRole)
      );
    }

    // Senior can approve expenses for Juniors and Trainees in their headquarters
    if (approverRole === UserRole.SENIOR) {
      return (
        approverHeadquarters === expenseUserHeadquarters &&
        [UserRole.JUNIOR, UserRole.TRAINEE].includes(expenseUserRole)
      );
    }

    // Junior and Trainee can't approve expenses
    return false;
  }

  /**
   * Determines if a user can view an expense
   */
  canViewExpense(viewerRole, viewerHeadquarters, expenseUserRole, expenseUserHeadquarters) {
    // Users can always view their own expenses
    if (viewerRole === expenseUserRole && viewerHeadquarters === expenseUserHeadquarters) {
      return true;
    }

    // Otherwise, use the same rules as for viewing users
    return this.canViewUser(
      viewerRole,
      viewerHeadquarters,
      expenseUserRole,
      expenseUserHeadquarters
    );
  }
}

export const accessControlService = new AccessControlService();