import { EntitySchema } from "typeorm";

// Define user roles
const UserRole = {
  TRAINEE: 'TRAINEE',
  JUNIOR: 'JUNIOR',
  SENIOR: 'SENIOR',
  TEAM_LEAD: 'TEAM_LEAD',
  EMPLOYEE: 'EMPLOYEE',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    username: {
      type: "varchar",
      length: 50,
      unique: true
    },
    email: {
      type: "varchar",
      length: 100,
      unique: true
    },
    password: {
      type: "varchar",
      select: false // For security, don't select by default
    },
    role: {
      type: "enum",
      enum: Object.values(UserRole),
      default: UserRole.TRAINEE
    },
    departmentId: {
      type: "uuid",
      nullable: true
    },
    headquartersId: {
      type: "uuid",
      nullable: true
    },
    dailyAllowanceRate: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0
    },
    assignedTravelCities: {
      type: "simple-array",
      nullable: true,
      default: []
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    expenses: {
      type: "one-to-many",
      target: "Expense",
      inverseSide: "user"
    },
    department: {
      type: "many-to-one",
      target: "Department",
      joinColumn: {
        name: "departmentId"
      }
    },
    headquarters: {
      type: "many-to-one",
      target: "Headquarters",
      joinColumn: {
        name: "headquartersId"
      }
    },
    approvedExpenses: {
      type: "one-to-many",
      target: "Expense",
      inverseSide: "approver"
    }
  }
});

export { User, UserRole };