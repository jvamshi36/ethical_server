/**
 * User role enum
 * @readonly
 * @enum {string}
 */
export const UserRole = {
  TRAINEE: 'TRAINEE',
  JUNIOR: 'JUNIOR',
  SENIOR: 'SENIOR',
  TEAM_LEAD: 'TEAM_LEAD',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} username - User's username
 * @property {string} email - User's email address
 * @property {string} password - Hashed password
 * @property {UserRole} role - User's role
 * @property {string} departmentId - Associated department ID
 * @property {string} headquartersId - Associated headquarters ID
 * @property {number} dailyAllowanceRate - Daily allowance rate
 * @property {string[]} assignedTravelCities - List of assigned travel cities
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Headquarters
 * @property {string} id - Unique identifier
 * @property {string} name - Headquarters name
 * @property {string} location - Physical location
 * @property {string} region - Region name
 * @property {string} country - Country name
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Department
 * @property {string} id - Unique identifier
 * @property {string} name - Department name
 * @property {string} headquartersId - Associated headquarters ID
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */