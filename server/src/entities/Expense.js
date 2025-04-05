import { EntitySchema } from "typeorm";

// Define expense status and type enums
const ExpenseStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

const ExpenseType = {
  TRAVEL: 'TRAVEL',
  SUPPLIES: 'SUPPLIES',
  MEALS: 'MEALS',
  EQUIPMENT: 'EQUIPMENT',
  OTHER: 'OTHER'
};

const Expense = new EntitySchema({
  name: "Expense",
  tableName: "expenses",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    userId: {
      type: "uuid"
    },
    date: {
      type: "date"
    },
    type: {
      type: "enum",
      enum: Object.values(ExpenseType)
    },
    amount: {
      type: "float"
    },
    description: {
      type: "varchar"
    },
    attachments: {
      type: "simple-array",
      nullable: true
    },
    headquartersId: {
      type: "uuid"
    },
    status: {
      type: "enum",
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.PENDING
    },
    approverId: {
      type: "uuid",
      nullable: true
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
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "userId"
      },
      inverseSide: "expenses"
    },
    headquarters: {
      type: "many-to-one",
      target: "Headquarters",
      joinColumn: {
        name: "headquartersId"
      }
    },
    approver: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "approverId"
      }
    }
  }
});

export { Expense, ExpenseStatus, ExpenseType };