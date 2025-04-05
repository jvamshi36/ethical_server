/**
 * Expense type enum
 * @readonly
 * @enum {string}
 */
export const ExpenseType = {
  DAILY: 'DAILY',
  TRAVEL: 'TRAVEL'
};

/**
 * Expense status enum
 * @readonly
 * @enum {string}
 */
export const ExpenseStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

/**
 * @typedef {Object} Expense
 * @property {string} id - Unique identifier
 * @property {string} userId - User who created the expense
 * @property {Date} date - Date of the expense
 * @property {ExpenseType} type - Type of expense
 * @property {number} amount - Amount of the expense
 * @property {ExpenseStatus} status - Current status of the expense
 * @property {string} [approverId] - User who approved/rejected the expense
 * @property {string} description - Description of the expense
 * @property {string[]} attachments - URLs to stored files
 * @property {string} headquartersId - Associated headquarters
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */